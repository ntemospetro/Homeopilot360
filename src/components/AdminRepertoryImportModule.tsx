import React, { useState, useEffect } from 'react';
import { 
  repertoryImportManager, 
  DatasetImportRecord, 
  LicenseStatus, 
  ImportStatus, 
  DryRunResult, 
  ValidationErrorItem,
  REPERTORY_IMPORT_BUILD_MARKER
} from '../services/repertory/repertoryImportManager';
import { runRepertoryImportTests, TestCaseResult } from '../services/repertory/repertoryImportTests';
import { AdminRepertoryPrepareModule } from './AdminRepertoryPrepareModule';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  Check, 
  XCircle, 
  Layers, 
  Database, 
  Activity, 
  Archive, 
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export const AdminRepertoryImportModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'import' | 'prepare' | 'sources' | 'reports' | 'active' | 'tests'>('overview');
  const [datasets, setDatasets] = useState<DatasetImportRecord[]>([]);
  
  // Import Form State
  const [fileName, setFileName] = useState('');
  const [fileFormat, setFileFormat] = useState<'JSON' | 'CSV' | 'TSV'>('JSON');
  const [rawFileContent, setRawFileContent] = useState('');
  const [sourceWork, setSourceWork] = useState('');
  const [sourceEdition, setSourceEdition] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('de');
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>('UNKNOWN');
  const [licenseNote, setLicenseNote] = useState('');
  
  // Active Dry Run State
  const [activeDryRunDataset, setActiveDryRunDataset] = useState<DatasetImportRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<{
    current_stage: string;
    error_name: string;
    error_message: string;
    error_stack: string;
  } | null>(null);

  // Test Results State
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);

  const refreshDatasets = () => {
    setDatasets(repertoryImportManager.getAllDatasets());
  };

  useEffect(() => {
    refreshDatasets();
    window.addEventListener('homoeo_repertory_datasets_updated', refreshDatasets);
    return () => {
      window.removeEventListener('homoeo_repertory_datasets_updated', refreshDatasets);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Datei ist zu groß (Max 5MB)');
      return;
    }
    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') setFileFormat('CSV');
    else if (ext === 'tsv') setFileFormat('TSV');
    else setFileFormat('JSON');

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string || '';
      setRawFileContent(content);
      showToast(`Datei ${file.name} erfolgreich geladen (${content.length} Zeichen)`);
    };
    reader.readAsText(file);
  };

  const handleStartDryRun = () => {
    setDiagnosticError(null);
    let current_stage = 'FILE_READ';
    try {
      if (!rawFileContent.trim()) {
        showToast('Bitte wählen Sie zuerst eine Datei aus oder fügen Sie Inhalt ein.');
        return;
      }
      if (!sourceWork.trim()) {
        showToast('Bitte geben Sie das Quellenwerk (source_work) an.');
        return;
      }

      current_stage = 'LOAD_STORAGE';
      console.log('[RUNTIME_TRACE_TYPES]', {
        datasets_type: typeof datasets,
        datasets_is_array: Array.isArray(datasets),
        records_type: typeof rawFileContent,
        records_is_array: false,
        audit_log_type: typeof datasets,
        audit_log_is_array: Array.isArray(datasets),
        errors_type: 'unknown',
        errors_is_array: false,
        unresolved_type: 'unknown',
        unresolved_is_array: false,
        remedies_type: 'unknown',
        remedies_is_array: false
      });

      current_stage = 'JSON_PARSE / JSON_NORMALIZE / SOURCE_METADATA / BUILD_DATASET / VALIDATE_RECORDS / VALIDATE_PARENT_REFERENCES / RESOLVE_REMEDIES / BUILD_REPORT / SAVE_STORAGE';
      const { dataset, dryRun } = repertoryImportManager.runDryRun(
        fileName || 'import_upload.json',
        fileFormat,
        rawFileContent,
        {
          source_work: sourceWork,
          source_edition: sourceEdition || null,
          source_language: sourceLanguage,
          license_status: licenseStatus,
          license_note: licenseNote
        }
      );

      current_stage = 'SET_REACT_STATE';
      setActiveDryRunDataset(dataset);

      current_stage = 'RENDER_RESULT';
      refreshDatasets();
      showToast('Dry Run erfolgreich durchgeführt.');
    } catch (err: any) {
      console.error('[RUNTIME_TRACE_ERROR]', err);
      setDiagnosticError({
        current_stage,
        error_name: err.name || 'Error',
        error_message: err.message || String(err),
        error_stack: err.stack || 'No stack trace available'
      });
      showToast(`Dry Run Fehler: ${err.message}`);
    }
  };

  const handleActivate = (importId: string) => {
    const success = repertoryImportManager.activateDataset(importId);
    if (success) {
      showToast('Datensatz erfolgreich aktiviert.');
      refreshDatasets();
    } else {
      showToast('Aktivierung fehlgeschlagen. Prüfen Sie die Voraussetzungen.');
    }
  };

  const handleArchive = (importId: string) => {
    repertoryImportManager.archiveDataset(importId);
    showToast('Datensatz archiviert.');
    refreshDatasets();
  };

  const handleReject = (importId: string) => {
    repertoryImportManager.rejectDataset(importId);
    showToast('Datensatz abgelehnt.');
    refreshDatasets();
  };

  const handleRunTests = () => {
    const results = runRepertoryImportTests();
    setTestResults(results);
    showToast('Integrationstests A-G ausgeführt.');
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Subnavigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
            activeSubTab === 'overview' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Übersicht</span>
        </button>
        <button
          onClick={() => setActiveSubTab('import')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
            activeSubTab === 'import' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Import & Dry Run</span>
        </button>
        <button
          onClick={() => setActiveSubTab('prepare')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
            activeSubTab === 'prepare' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Daten aufbereiten</span>
        </button>
        <button
          onClick={() => setActiveSubTab('sources')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
            activeSubTab === 'sources' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Quellen</span>
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
            activeSubTab === 'reports' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Validierungsberichte</span>
        </button>
        <button
          onClick={() => setActiveSubTab('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
            activeSubTab === 'active' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Aktive Datensätze</span>
        </button>
        <button
          onClick={() => setActiveSubTab('tests')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
            activeSubTab === 'tests' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tests A-G</span>
        </button>
      </div>

      {/* PREPARE SUB-TAB */}
      {activeSubTab === 'prepare' && (
        <AdminRepertoryPrepareModule />
      )}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Gesamte Datensätze</h3>
            <p className="text-3xl font-bold text-slate-900">{datasets.length}</p>
            <p className="text-xs text-slate-500 mt-1">In der Import-Registry registriert</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Aktive Datensätze</h3>
            <p className="text-3xl font-bold text-emerald-600">
              {datasets.filter(d => d.status === 'ACTIVE').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Freigegeben und im System</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Ausstehende Validierungen</h3>
            <p className="text-3xl font-bold text-amber-600">
              {datasets.filter(d => d.status === 'DRY_RUN' || d.status === 'VALIDATED').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Warten auf Admin-Prüfung / Freigabe</p>
          </div>

          <div className="md:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Repertorium Import-Governance</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dieses Modul ermöglicht die strukturierte Einbindung neuer homöopathischer Repertoriumsdaten. Gemäß den Sicherheits- und Governance-Richtlinien werden alle Importe vor der Aktivierung einem strengen Dry Run, Format-Check, Remedy-Identity-Abgleich und Lizenz-Audit unterzogen. Aktivierte Datensätze fließen kontrolliert ein.
              </p>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-xs font-mono text-indigo-700 whitespace-nowrap">
              REPERTORY_IMPORT_BUILD: <strong className="font-bold">runtime-trace-v4</strong>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT & DRY RUN SUB-TAB */}
      {activeSubTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>Neuen Repertorium-Datensatz importieren</span>
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Datei auswählen (JSON, CSV, TSV - Max 5MB)</label>
              <input 
                type="file" 
                accept=".json,.csv,.tsv"
                onChange={handleFileUploadMock}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-xl p-2"
              />
              {fileName && <p className="text-xs text-slate-500 mt-1">Ausgewählt: {fileName} ({fileFormat})</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quellenwerk (source_work) *</label>
                <input 
                  type="text" 
                  value={sourceWork} 
                  onChange={e => setSourceWork(e.target.value)} 
                  placeholder="z.B. Kent Repertory 6th Edition"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Edition (optional)</label>
                <input 
                  type="text" 
                  value={sourceEdition} 
                  onChange={e => setSourceEdition(e.target.value)} 
                  placeholder="z.B. 6. Auflage"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sprache</label>
                <select 
                  value={sourceLanguage} 
                  onChange={e => setSourceLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="de">Deutsch (de)</option>
                  <option value="en">English (en)</option>
                  <option value="fr">Français (fr)</option>
                  <option value="es">Español (es)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lizenz-Status *</label>
                <select 
                  value={licenseStatus} 
                  onChange={e => setLicenseStatus(e.target.value as LicenseStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="UNKNOWN">UNKNOWN (Default)</option>
                  <option value="VERIFIED_ALLOWED">VERIFIED_ALLOWED</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lizenz-Hinweis / Notiz</label>
              <input 
                type="text" 
                value={licenseNote} 
                onChange={e => setLicenseNote(e.target.value)} 
                placeholder="z.B. Public domain or cleared with copyright holder"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rohdaten-Inhalt (JSON / CSV Vorschau)</label>
              <textarea 
                rows={6}
                value={rawFileContent}
                onChange={e => setRawFileContent(e.target.value)}
                placeholder='[{"rubric_id": "r1", "chapter": "GENERALS", "rubric_text_original": "...", "remedies": {"bry": 3}}]'
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleStartDryRun}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Dry Run starten</span>
            </button>
          </div>

          {/* Right: Dry Run Result */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Dry Run & Validierungsbericht</span>
            </h2>

            {diagnosticError && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-3 font-mono text-xs shadow-sm">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>RUNTIME DIAGNOSTIC</span>
                </div>
                <div className="space-y-1 text-slate-800">
                  <div><strong>STAGE:</strong> {diagnosticError.current_stage}</div>
                  <div><strong>ERROR_NAME:</strong> {diagnosticError.error_name}</div>
                  <div><strong>ERROR_MESSAGE:</strong> {diagnosticError.error_message}</div>
                  <div className="mt-2">
                    <strong>ERROR_STACK:</strong>
                    <pre className="bg-slate-900 text-rose-300 p-3 rounded-xl mt-1 overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap">{diagnosticError.error_stack}</pre>
                  </div>
                </div>
              </div>
            )}

            {activeDryRunDataset && activeDryRunDataset.dry_run_result ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Datei:</span>
                    <span className="font-medium text-slate-900">{activeDryRunDataset.dry_run_result.file_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Format:</span>
                    <span className="font-medium text-slate-900">{activeDryRunDataset.dry_run_result.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quellenwerk:</span>
                    <span className="font-medium text-slate-900">{activeDryRunDataset.dry_run_result.source_work}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gesamte Datensätze:</span>
                    <span className="font-medium text-slate-900">{activeDryRunDataset.dry_run_result.total_records}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gültige Datensätze:</span>
                    <span className="font-medium text-emerald-600">{activeDryRunDataset.dry_run_result.valid_records}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fehlerhafte Datensätze:</span>
                    <span className="font-medium text-rose-600">{activeDryRunDataset.dry_run_result.invalid_records}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unresolved Remedy IDs:</span>
                    <span className="font-medium text-amber-600">{(activeDryRunDataset.dry_run_result.unresolved_remedy_ids || []).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lizenz-Status:</span>
                    <span className="font-semibold text-indigo-600">{activeDryRunDataset.dry_run_result.license_status}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-700 font-medium">Bereit für Aktivierung:</span>
                    <span className={`font-bold ${activeDryRunDataset.dry_run_result.ready_for_activation ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {activeDryRunDataset.dry_run_result.ready_for_activation ? 'JA' : 'NEIN (Sperre aktiv)'}
                    </span>
                  </div>
                </div>

                {/* Unresolved Remedies List */}
                {((activeDryRunDataset.dry_run_result.unresolved_remedy_ids || []).length > 0) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Unresolved Remedy IDs</h4>
                    <div className="space-y-1">
                      {(activeDryRunDataset.dry_run_result.unresolved_remedy_ids || []).map((ur, idx) => (
                        <div key={idx} className="text-xs flex justify-between text-amber-900 font-mono">
                          <span>{ur.source_remedy_id}</span>
                          <span>{ur.record_count} mal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error list */}
                {((activeDryRunDataset.dry_run_result.error_list || []).length > 0) && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Validierungsfehler ({(activeDryRunDataset.dry_run_result.error_list || []).length})</h4>
                    {(activeDryRunDataset.dry_run_result.error_list || []).map((err, idx) => (
                      <div key={idx} className="text-xs bg-white p-2 rounded border border-rose-100 flex flex-col">
                        <div className="flex justify-between font-bold text-rose-700">
                          <span>Row {err.record_index + 1} [{err.rubric_id}]</span>
                          <span className="bg-rose-100 px-1.5 py-0.5 rounded">{err.error_code}</span>
                        </div>
                        <span className="text-slate-600 mt-1">{err.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    disabled={!activeDryRunDataset.dry_run_result.ready_for_activation}
                    onClick={() => handleActivate(activeDryRunDataset.import_id)}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all shadow flex items-center justify-center space-x-2 ${
                      activeDryRunDataset.dry_run_result.ready_for_activation 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Datensatz aktivieren</span>
                  </button>
                  <button
                    onClick={() => handleReject(activeDryRunDataset.import_id)}
                    className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-medium text-sm transition-all border border-rose-200"
                  >
                    Ablehnen
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Noch kein Dry Run ausgeführt.</p>
                <p className="text-xs text-slate-400 mt-1">Laden Sie eine Datei hoch und starten Sie den Dry Run.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SOURCES SUB-TAB */}
      {activeSubTab === 'sources' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Repertorium Quellen-Registry & Register</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Dataset ID</th>
                  <th className="p-3">Quellenwerk</th>
                  <th className="p-3">Edition / Sprache</th>
                  <th className="p-3">Lizenz & Hinweis</th>
                  <th className="p-3">Rubriken</th>
                  <th className="p-3">Remedy-Zuordnungen</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(datasets) ? datasets : []).map(ds => (
                  <tr key={ds.import_id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs">{ds.import_id}</td>
                    <td className="p-3 font-medium text-slate-900">{ds.source_work}</td>
                    <td className="p-3">{ds.source_edition || '-'} ({ds.source_language.toUpperCase()})</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block w-fit ${
                          ds.license_status === 'VERIFIED_ALLOWED' ? 'bg-emerald-100 text-emerald-800' :
                          ds.license_status === 'RESTRICTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ds.license_status}
                        </span>
                        {ds.license_note && <span className="text-[11px] text-slate-400">{ds.license_note}</span>}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{ds.rubric_count}</td>
                    <td className="p-3 font-semibold text-indigo-600">{ds.remedy_mapping_count}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        ds.status === 'ACTIVE' ? 'bg-emerald-600 text-white' :
                        ds.status === 'VALIDATED' ? 'bg-indigo-100 text-indigo-800' :
                        ds.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ds.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VALIDATION REPORTS SUB-TAB */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Validierungsberichte & Audit Trail</span>
          </h2>
          <div className="space-y-4">
            {(Array.isArray(datasets) ? datasets : []).map(ds => (
              <div key={ds.import_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">{ds.file_name} ({ds.source_work})</h3>
                    <p className="text-xs text-slate-500">Hochgeladen am: {new Date(ds.uploaded_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    ds.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {ds.status}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Audit Trail</h4>
                  <div className="space-y-1">
                    {(Array.isArray(ds.audit_log) ? ds.audit_log : []).map((log, idx) => (
                      <div key={idx} className="text-xs flex justify-between text-slate-600 font-mono">
                        <span>[{new Date(log.timestamp).toLocaleTimeString()}] {log.action}</span>
                        <span>{log.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE DATASETS SUB-TAB */}
      {activeSubTab === 'active' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span>Aktive Datensätze (Registry)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(datasets) ? datasets.filter(ds => ds.status === 'ACTIVE') : []).length > 0 ? (
              (Array.isArray(datasets) ? datasets.filter(ds => ds.status === 'ACTIVE') : []).map(ds => (
                <div key={ds.import_id} className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{ds.source_work}</h3>
                      <p className="text-xs text-slate-500">Datei: {ds.file_name}</p>
                    </div>
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded">ACTIVE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-emerald-100">
                    <div>Rubriken: <strong className="text-slate-900">{ds.rubric_count}</strong></div>
                    <div>Remedy Mappings: <strong className="text-slate-900">{ds.remedy_mapping_count}</strong></div>
                    <div>Aktiv seit: <strong className="text-slate-900">{ds.active_since ? new Date(ds.active_since).toLocaleDateString() : '-'}</strong></div>
                    <div>Checksum: <strong className="text-slate-900 font-mono">{ds.checksum.slice(0, 8)}...</strong></div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button 
                      onClick={() => handleArchive(ds.import_id)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition-all flex items-center space-x-1"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archivieren</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-slate-400">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Keine aktiven Datensätze gefunden.</p>
                <p className="text-xs text-slate-400 mt-1">Aktivieren Sie geprüfte Datensätze über den Import-Bereich.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TESTS A-G SUB-TAB */}
      {activeSubTab === 'tests' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>Repertorium Import Tests (A - G)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Automatisiertes Testen aller Governance- und Validierungsregeln</p>
            </div>
            <button
              onClick={handleRunTests}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tests ausführen</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {(Array.isArray(testResults) ? testResults : []).length > 0 ? (
              (Array.isArray(testResults) ? testResults : []).map(test => (
                <div key={test.test_id} className={`p-4 rounded-xl border flex items-center justify-between ${
                  test.passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${test.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                        {test.test_id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{test.test_name}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">Erwartet: {test.expected} | Tatsächlich: {test.actual}</p>
                  </div>
                  <div>
                    {test.passed ? (
                      <span className="flex items-center text-emerald-600 text-xs font-bold space-x-1">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="flex items-center text-rose-600 text-xs font-bold space-x-1">
                        <XCircle className="w-5 h-5" />
                        <span>FAIL</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Klicken Sie auf "Tests ausführen", um Tests A bis G zu starten.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
