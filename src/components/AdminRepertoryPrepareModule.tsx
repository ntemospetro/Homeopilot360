import React, { useState } from 'react';
import { KentSourceAdapter } from '../services/repertory/sourceAdapters/kentSourceAdapter';
import { BogerSourceAdapter } from '../services/repertory/sourceAdapters/bogerSourceAdapter';
import { BoerickeSourceAdapter } from '../services/repertory/sourceAdapters/boerickeSourceAdapter';
import { GenericCsvSourceAdapter } from '../services/repertory/sourceAdapters/genericCsvSourceAdapter';
import { RepertorySourceAdapter } from '../services/repertory/sourceAdapters/repertorySourceAdapter';
import { runRepertoryCsvPreflight } from '../services/repertory/sourceAdapters/repertoryCsvPreflight';
import { exportRowsToCsvString } from '../services/repertory/sourceAdapters/repertoryCsvExporter';
import { CanonicalCsvRow, PreflightReport } from '../services/repertory/sourceAdapters/canonicalRepertoryCsvTypes';
import { 
  FileSpreadsheet, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Download, 
  FileText, 
  X, 
  ShieldCheck, 
  Info 
} from 'lucide-react';

export const AdminRepertoryPrepareModule: React.FC = () => {
  const [sourceType, setSourceType] = useState('Kent');
  const [sourceWork, setSourceWork] = useState('Repertory of the Homoeopathic Materia Medica');
  const [sourceAuthor, setSourceAuthor] = useState('James Tyler Kent');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [licenseStatus, setLicenseStatus] = useState('UNKNOWN');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [preflightResult, setPreflightResult] = useState<PreflightReport | null>(null);
  const [parsedRows, setParsedRows] = useState<CanonicalCsvRow[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string || '';
      setRawText(content);
      showToast(`Rohdatei ${file.name} geladen (${content.length} Zeichen).`);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!rawText.trim()) {
      showToast('Bitte wählen Sie eine Rohdatei aus oder fügen Sie Daten ein.');
      return;
    }
    if (!sourceWork.trim()) {
      showToast('Quellenwerk (source_work) ist ein Pflichtfeld.');
      return;
    }

    try {
      let adapter: RepertorySourceAdapter;
      if (sourceType === 'Boger') {
        adapter = new BogerSourceAdapter();
      } else if (sourceType === 'Boericke') {
        adapter = new BoerickeSourceAdapter();
      } else if (sourceType === 'GenericCsv') {
        adapter = new GenericCsvSourceAdapter();
      } else {
        adapter = new KentSourceAdapter();
      }

      const rows = adapter.preprocessRawContent(rawText, 'dataset_prep_' + Date.now(), {
        source_work: sourceWork,
        source_author: sourceAuthor,
        source_language: sourceLanguage,
        license_status: licenseStatus
      });
      setParsedRows(rows);
      const report = runRepertoryCsvPreflight(rows);
      setPreflightResult(report);
      showToast(`Analyse abgeschlossen: ${report.total_rows} Zeilen analysiert.`);
    } catch (e: any) {
      showToast(`Analyse-Fehler: ${e.message}`);
    }
  };

  const handleExportReadyCsv = () => {
    if (!preflightResult || !preflightResult.ready_for_import) {
      showToast('Datensatz ist nicht importfertig (Ready = FALSE).');
      return;
    }
    const csvString = exportRowsToCsvString(parsedRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName || 'repertory_ready'}_ready.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Importfertige CSV erfolgreich heruntergeladen.');
  };

  const downloadExampleCsv = () => {
    const exampleRow: CanonicalCsvRow = {
      dataset_id: 'kent-extremities-sprained-ankle-v1',
      source_work: 'Repertory of the Homoeopathic Materia Medica',
      source_author: 'James Tyler Kent',
      source_language: 'en',
      source_page: 1084,
      chapter: 'EXTREMITIES',
      rubric_id: 'kent-extremities-pain-sprained-ankle',
      parent_rubric_id: 'kent-extremities-pain-sprained',
      rubric_path: 'EXTREMITIES > PAIN > SPRAINED > ANKLE',
      rubric_text_original: 'Ankle',
      source_remedy_id: 'bry',
      canonical_remedy_id: 'bryonia-alba',
      canonical_name: 'Bryonia alba',
      grade: 1,
      grade_original: 'ROMAN',
      source_reference: 'Kent p. 1084',
      license_status: 'UNKNOWN'
    };
    const csv = exportRowsToCsvString([exampleRow]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kent_repertory_example_ready.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-sm animate-fade-in flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            <FileSpreadsheet className="w-4 h-4" /> Repertorium Pipeline
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Daten aufbereiten & Preflight</h2>
          <p className="text-sm text-slate-600 mt-1">
            Bereitet Repertorium-Rohdaten vor dem eigentlichen Import auf. Die erzeugte CSV ist bereits gegen den Canonical Remedy Master, Rubrik-Hierarchien, Grades und Provenance geprüft.
          </p>
        </div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium text-sm transition-colors border border-slate-200 shrink-0"
        >
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          CSV-Aufbau anzeigen / Hilfe
        </button>
      </div>

      {/* Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">1. Quellen- & Metadateneinstellungen</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Quelle</label>
            <select
              value={sourceType}
              onChange={(e) => {
                const val = e.target.value;
                setSourceType(val);
                if (val === 'Boger') {
                  setSourceWork('Synoptic Key of the Materia Medica');
                  setSourceAuthor('Cyrus Maxwell Boger');
                } else if (val === 'Boericke') {
                  setSourceWork('Pocket Manual of Homoeopathic Materia Medica');
                  setSourceAuthor('William Boericke');
                } else if (val === 'GenericCsv') {
                  setSourceWork('Generic Repertory Dataset');
                  setSourceAuthor('Unknown Author');
                } else {
                  setSourceWork('Repertory of the Homoeopathic Materia Medica');
                  setSourceAuthor('James Tyler Kent');
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Kent">Kent (James Tyler Kent)</option>
              <option value="Boger">Boger (Cyrus Maxwell Boger)</option>
              <option value="Boericke">Boericke (William Boericke)</option>
              <option value="GenericCsv">Generic CSV</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Quellenwerk (source_work)</label>
            <input
              type="text"
              value={sourceWork}
              onChange={(e) => setSourceWork(e.target.value)}
              placeholder="Repertory of the Homoeopathic Materia Medica"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Pflichtfeld. Beispiel für Kent: Repertory of the Homoeopathic Materia Medica</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Autor</label>
            <input
              type="text"
              value={sourceAuthor}
              onChange={(e) => setSourceAuthor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Sprache</label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="en">English (en)</option>
              <option value="de">Deutsch (de)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Lizenzstatus</label>
            <select
              value={licenseStatus}
              onChange={(e) => setLicenseStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="UNKNOWN">UNKNOWN</option>
              <option value="VERIFIED_ALLOWED">VERIFIED_ALLOWED</option>
              <option value="RESTRICTED">RESTRICTED</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-medium text-slate-700 mb-2">Rohdatei auswählen (CSV oder JSON)</label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium text-sm cursor-pointer transition-colors border border-slate-200">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Rohdatei auswählen</span>
              <input type="file" accept=".csv,.json,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-sm text-slate-600 font-medium">
              {fileName ? fileName : 'Keine Datei ausgewählt'}
            </span>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">Oder Rohdaten direkt einfügen:</label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Fügen Sie hier CSV-Zeilen oder JSON-Inhalte ein..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Datei analysieren (Preflight)
            </button>
          </div>
        </div>
      </div>

      {/* Preflight Results Report */}
      {preflightResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Preflight-Bericht</h3>
              <p className="text-xs text-slate-500">Vollständige Validierung gegen Canonical Remedy Master & Hierarchien</p>
            </div>
            <div>
              {preflightResult.ready_for_import ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> READY FOR IMPORT: JA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> READY FOR IMPORT: NEIN
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Rows</span>
              <span className="text-2xl font-bold text-slate-900">{preflightResult.total_rows}</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-700 block">Valid Rows</span>
              <span className="text-2xl font-bold text-emerald-800">{preflightResult.valid_rows}</span>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
              <span className="text-xs text-rose-700 block">Invalid Rows</span>
              <span className="text-2xl font-bold text-rose-800">{preflightResult.invalid_rows}</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <span className="text-xs text-amber-700 block">Duplicate Rows</span>
              <span className="text-2xl font-bold text-amber-800">{preflightResult.duplicate_rows}</span>
            </div>
          </div>

          {/* Detailed Error Breakdown if not ready */}
          {!preflightResult.ready_for_import && (
            <div className="space-y-3 bg-rose-50/50 p-4 rounded-xl border border-rose-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">Gefundene Validierungsfehler:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {Array.isArray(preflightResult.unresolved_source_remedy_ids) && preflightResult.unresolved_source_remedy_ids.length > 0 && (
                  <div className="text-xs text-rose-900 bg-white p-2.5 rounded-lg border border-rose-200">
                    <strong>Unresolved Source Remedy IDs:</strong> {preflightResult.unresolved_source_remedy_ids.join(', ')}
                  </div>
                )}
                {Array.isArray(preflightResult.missing_parent_rubrics) && preflightResult.missing_parent_rubrics.length > 0 && (
                  <div className="text-xs text-rose-900 bg-white p-2.5 rounded-lg border border-rose-200">
                    <strong>Missing Parent Rubrics:</strong> {preflightResult.missing_parent_rubrics.join(', ')}
                  </div>
                )}
                {Array.isArray(preflightResult.invalid_grades) && preflightResult.invalid_grades.length > 0 && (
                  <div className="text-xs text-rose-900 bg-white p-2.5 rounded-lg border border-rose-200">
                    <strong>Invalid Grades:</strong> {preflightResult.invalid_grades.join(', ')} (erlaubt: 1, 2, 3)
                  </div>
                )}
                {preflightResult.missing_provenance.length > 0 && (
                  <div className="text-xs text-rose-900 bg-white p-2.5 rounded-lg border border-rose-200">
                    <strong>Missing Provenance:</strong> Pflichtfelder fehlen in {preflightResult.missing_provenance.length} Zeilen.
                  </div>
                )}
                {preflightResult.errors.slice(0, 15).map((err, idx) => (
                  <div key={idx} className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                    <span>[Row {err.row_index + 1} | Rubric: {err.rubric_id}] <span className="text-rose-600 font-semibold">{err.error_code}</span>: {err.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {preflightResult.ready_for_import ? (
              <button
                onClick={handleExportReadyCsv}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                Importfertige CSV erzeugen & herunterladen
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-400 rounded-xl font-medium text-sm cursor-not-allowed"
              >
                Importfertige CSV erzeugen (Nicht bereit)
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSV Help Modal / Popup */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Standardisierte CSV-Struktur & Aufbau</h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <p className="text-sm text-slate-600">
                Diese Spezifikation definiert das verbindliche Format für importfertige Repertorium-CSVs. Alle Pflichtfelder müssen vollständig und fehlerfrei ausgefüllt sein.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Feld</th>
                      <th className="p-3">Pflicht</th>
                      <th className="p-3">Beschreibung</th>
                      <th className="p-3">Beispiel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600">
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">dataset_id</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Eindeutige ID des Datensatzes</td>
                      <td className="p-3 font-mono text-[11px]">kent-extremities-sprained-ankle-v1</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">source_work</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Titel des Quellenwerks</td>
                      <td className="p-3 font-mono text-[11px]">Repertory of the Homoeopathic Materia Medica</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">source_author</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Autor der Quelle</td>
                      <td className="p-3 font-mono text-[11px]">James Tyler Kent</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">source_language</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Sprache der Quelle</td>
                      <td className="p-3 font-mono text-[11px]">en</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">source_page</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Gedruckte Quellenseite</td>
                      <td className="p-3 font-mono text-[11px]">1084</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">chapter</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Hauptkapitel</td>
                      <td className="p-3 font-mono text-[11px]">EXTREMITIES</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">rubric_id</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Eindeutige technische Rubrik-ID</td>
                      <td className="p-3 font-mono text-[11px]">kent-extremities-pain-sprained-ankle</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">parent_rubric_id</td>
                      <td className="p-3 text-amber-600 font-semibold">Ja außer Root</td>
                      <td className="p-3">Parent-Rubrik</td>
                      <td className="p-3 font-mono text-[11px]">kent-extremities-pain-sprained</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">rubric_path</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Vollständiger Rubrikpfad</td>
                      <td className="p-3 font-mono text-[11px]">EXTREMITIES &gt; PAIN &gt; SPRAINED &gt; ANKLE</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">rubric_text_original</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Originaltext der Rubrik</td>
                      <td className="p-3 font-mono text-[11px]">Ankle</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">source_remedy_id</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Originale Quellenabkürzung</td>
                      <td className="p-3 font-mono text-[11px]">bry</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">canonical_remedy_id</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Canonical Remedy ID</td>
                      <td className="p-3 font-mono text-[11px]">bryonia-alba</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">canonical_name</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Canonical Remedy Name</td>
                      <td className="p-3 font-mono text-[11px]">Bryonia alba</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">grade</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Normalisierte Gradzahl (1, 2, 3)</td>
                      <td className="p-3 font-mono text-[11px]">1</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">grade_original</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Originalgrad / Typografie</td>
                      <td className="p-3 font-mono text-[11px]">ROMAN</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">source_reference</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Quellenangabe</td>
                      <td className="p-3 font-mono text-[11px]">Kent p. 1084</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-slate-900">license_status</td>
                      <td className="p-3 text-emerald-600 font-semibold">Ja</td>
                      <td className="p-3">Lizenzstatus</td>
                      <td className="p-3 font-mono text-[11px]">UNKNOWN</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Wichtige Regeln:</h4>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  <li>Eine CSV-Zeile = eine Rubrik–Remedy-Zuordnung.</li>
                  <li>source_remedy_id bleibt die historische Originalabkürzung.</li>
                  <li>canonical_remedy_id muss im Canonical Remedy Master existieren.</li>
                  <li>Keine fuzzy Remedy-Zuordnung oder geratene IDs.</li>
                  <li>Keine unresolved Remedies in der importfertigen CSV.</li>
                  <li>Rubrik-IDs müssen eindeutig sein und Parent-Verknüpfungen müssen gültig sein.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Beispielzeile:</h4>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-nowrap">
                  dataset_id,source_work,source_author,source_language,source_page,chapter,rubric_id,parent_rubric_id,rubric_path,rubric_text_original,source_remedy_id,canonical_remedy_id,canonical_name,grade,grade_original,source_reference,license_status<br/>
                  kent-extremities-sprained-ankle-v1,Repertory of the Homoeopathic Materia Medica,James Tyler Kent,en,1084,EXTREMITIES,kent-extremities-pain-sprained-ankle,kent-extremities-pain-sprained,"EXTREMITIES &gt; PAIN &gt; SPRAINED &gt; ANKLE",Ankle,bry,bryonia-alba,Bryonia alba,1,ROMAN,"Kent p. 1084",UNKNOWN
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={downloadExampleCsv}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium text-sm transition-colors border border-slate-200"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Beispiel-CSV herunterladen
                </button>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Verstanden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
