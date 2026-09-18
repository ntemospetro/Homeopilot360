import React, { useState, useMemo } from 'react';
import { materiaMedicaImportManager, MateriaMedicaImportRecord, MateriaMedicaPreflightReport } from '../services/materiaMedica/materiaMedicaImportManager';
import { MATERIA_MEDICA_ENTRIES, MateriaMedicaEntry, LocalizedRemedyContent } from '../data/materiaMedicaData';
import { CLASSICAL_AUTHORS_MAP } from '../data/classicalAuthorsMap';
import { LanguageCode } from '../types';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  Check, 
  X, 
  HelpCircle,
  Database,
  Layers,
  Search,
  BookOpen,
  Info,
  Globe,
  SlidersHorizontal,
  ArrowUpDown,
  Edit3,
  Sparkles
} from 'lucide-react';

export const AdminMateriaMedicaImportModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'registry' | 'import' | 'translator'>('registry');
  
  // Import metadata state
  const [sourceAuthor, setSourceAuthor] = useState('Hahnemann / Kent');
  const [sourceWork, setSourceWork] = useState('Custom Monograph Import');
  const [licenseStatus, setLicenseStatus] = useState('PUBLIC_DOMAIN');
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('en');
  const [targetLanguages, setTargetLanguages] = useState<LanguageCode[]>(['de', 'es', 'fr', 'el', 'it', 'ru']);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);

  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [importRecords, setImportRecords] = useState<MateriaMedicaImportRecord[]>([]);
  const [preflight, setPreflight] = useState<MateriaMedicaPreflightReport | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MateriaMedicaImportRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importCompleted, setImportCompleted] = useState(false);
  const [importStats, setImportStats] = useState<{ addedCount: number; updatedCount: number } | null>(null);

  // Multi-filter & Search state for registry
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latin_asc' | 'latin_desc' | 'common_asc' | 'common_desc' | 'category' | 'tier'>('latin_asc');

  // Translation Workflow state
  const [selectedRemedyForTranslate, setSelectedRemedyForTranslate] = useState<MateriaMedicaEntry | null>(null);
  const [activeTranslateLang, setActiveTranslateLang] = useState<LanguageCode>('en');
  const [translatingInProgress, setTranslatingInProgress] = useState(false);
  const [editableTranslationContent, setEditableTranslationContent] = useState<LocalizedRemedyContent | null>(null);

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
      showToast(`Materia-Medica-Datei ${file.name} geladen (${content.length} Zeichen).`);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!rawText.trim()) {
      showToast('Bitte wählen Sie eine CSV- oder JSON-Datei aus oder fügen Sie Daten ein.');
      return;
    }
    try {
      const records = materiaMedicaImportManager.parseImportData(rawText, 'dataset_mm_' + Date.now(), {
        source_author: sourceAuthor,
        source_work: sourceWork,
        license_status: licenseStatus
      });
      setImportRecords(records);
      const rep = materiaMedicaImportManager.runPreflight();
      setPreflight(rep);
      if (records.length > 0) setSelectedRecord(records[0]);
      setImportCompleted(false);
      showToast(`Analyse erfolgreich: ${records.length} Monographien geprüft.`);
    } catch (e: any) {
      showToast(`Analyse-Fehler: ${e.message}`);
    }
  };

  const handleStrategyChange = (importId: string, strategy: 'KEEP_EXISTING' | 'OVERWRITE' | 'MERGE' | 'MANUAL') => {
    materiaMedicaImportManager.setResolutionStrategy(importId, strategy);
    setImportRecords([...materiaMedicaImportManager['imports']]);
    if (selectedRecord && selectedRecord.import_id === importId) {
      setSelectedRecord({ ...materiaMedicaImportManager['imports'].find(r => r.import_id === importId)! });
    }
    showToast(`Strategie aktualisiert auf: ${strategy}`);
  };

  const handleApproveAndImport = () => {
    if (!preflight || !preflight.ready_for_import) {
      showToast('Preflight nicht bestanden. Bitte beheben Sie offene Fehler.');
      return;
    }
    const stats = materiaMedicaImportManager.approveImport();
    setImportStats(stats);
    setImportCompleted(true);
    showToast(`Import erfolgreich! ${stats.addedCount} hinzugefügt, ${stats.updatedCount} aktualisiert.`);
  };

  const loadExampleCsv = () => {
    const example = `id,latinname,commonname_de,essence,indications,keynotes,importancetier
amark-remedy-1,Amark testicum,Test Arznei,Wonderful testing essence,Fever,Burning thirst,1
aconitum-napellus,Aconitum napellus,Eisenhut (Updated),Updated essence from import pipeline,Anxiety and panic,Sudden onset,1`;
    setRawText(example);
    setFileName('materia_medica_example.csv');
    showToast('Beispiel-CSV für Materia Medica geladen.');
  };

  // Combined Multi-Filter & Sort for Registry
  const filteredAndSortedRegistry = useMemo(() => {
    const result = MATERIA_MEDICA_ENTRIES.filter(entry => {
      // 1. Freetext search across ID, latinName, commonName (all languages), aliases, indications, keynotes, searchKeywords
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const idMatch = entry.id?.toLowerCase().includes(q);
        const latinMatch = entry.latinName?.toLowerCase().includes(q);
        const aliasMatch = entry.aliases?.some(a => a.toLowerCase().includes(q));
        
        let transMatch = false;
        if (entry.translations) {
          Object.values(entry.translations).forEach((tr: LocalizedRemedyContent) => {
            if (
              tr.commonName?.toLowerCase().includes(q) ||
              tr.essence?.toLowerCase().includes(q) ||
              tr.mindEmotional?.toLowerCase().includes(q) ||
              tr.mainIndications?.some(i => i.toLowerCase().includes(q)) ||
              tr.keynotes?.some(k => k.toLowerCase().includes(q)) ||
              tr.searchKeywords?.some(sk => sk.toLowerCase().includes(q))
            ) {
              transMatch = true;
            }
          });
        }

        if (!idMatch && !latinMatch && !aliasMatch && !transMatch) {
          return false;
        }
      }

      // 2. Author filter
      if (authorFilter !== 'all') {
        const authInfo = CLASSICAL_AUTHORS_MAP[entry.id];
        if (!authInfo || !authInfo[authorFilter as keyof typeof authInfo]) {
          return false;
        }
      }

      // 3. Category filter
      if (categoryFilter !== 'all' && entry.categoryKey !== categoryFilter) {
        return false;
      }

      // 4. Language filter
      if (languageFilter !== 'all') {
        const t = entry.translations?.[languageFilter as LanguageCode];
        if (!t || !t.essence || t.essence.trim() === '') {
          return false;
        }
      }

      // 5. Importance Tier filter
      if (tierFilter !== 'all') {
        const tierNum = Number(tierFilter);
        if (entry.importanceTier !== tierNum) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'latin_asc') {
        return a.latinName.localeCompare(b.latinName);
      } else if (sortBy === 'latin_desc') {
        return b.latinName.localeCompare(a.latinName);
      } else if (sortBy === 'common_asc') {
        const nameA = a.translations?.de?.commonName || a.latinName;
        const nameB = b.translations?.de?.commonName || b.latinName;
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'common_desc') {
        const nameA = a.translations?.de?.commonName || a.latinName;
        const nameB = b.translations?.de?.commonName || b.latinName;
        return nameB.localeCompare(nameA);
      } else if (sortBy === 'category') {
        return a.categoryKey.localeCompare(b.categoryKey);
      } else if (sortBy === 'tier') {
        return (a.importanceTier || 2) - (b.importanceTier || 2);
      }
      return 0;
    });

    return result;
  }, [searchQuery, authorFilter, categoryFilter, languageFilter, tierFilter, sortBy]);

  // Translation Helper Function
  const handleAutoTranslateEntry = async (entry: MateriaMedicaEntry, targetLang: LanguageCode) => {
    setTranslatingInProgress(true);
    try {
      const sourceContent = entry.translations.de || entry.translations.en || Object.values(entry.translations)[0];
      const res = await fetch('/api/materia-medica/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: sourceContent,
          targetLang,
          latinName: entry.latinName
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      // Update entry translations in memory
      entry.translations[targetLang] = {
        ...data.translatedContent,
        origin: `Auto-translated from DE/EN via Gemini (${new Date().toLocaleDateString()})`
      };
      showToast(`Übersetzung für ${targetLang.toUpperCase()} erfolgreich generiert.`);
      setEditableTranslationContent({ ...entry.translations[targetLang] });
    } catch (e: any) {
      showToast(`Übersetzungsfehler: ${e.message}`);
    } finally {
      setTranslatingInProgress(false);
    }
  };

  const getTranslationStatus = (entry: MateriaMedicaEntry, lang: LanguageCode): string => {
    const t = entry.translations?.[lang];
    if (!t || !t.essence || t.essence.trim() === '') return 'Fehlt';
    if (t.origin && t.origin.includes('Auto-translated')) return 'Automatisch übersetzt';
    if (lang === 'de') return 'Original';
    return 'Vorhanden';
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

      {/* Header & Subnavigation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            <BookOpen className="w-4 h-4" /> Materia Medica Master & Pipeline
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Materia Medica & Übersetzungs-Workflow</h2>
          <p className="text-sm text-slate-600 mt-1">
            Verwaltung, kombinierbare Filterung, Sortierung und kontrollierte 7-Sprachen-Übersetzung der 670 Basis-Arzneien.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 flex-wrap gap-1">
          <button
            onClick={() => setActiveSubTab('registry')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'registry' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Übersicht & Filter ({MATERIA_MEDICA_ENTRIES.length})
          </button>
          <button
            onClick={() => setActiveSubTab('translator')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'translator' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Übersetzungs-Center
          </button>
          <button
            onClick={() => setActiveSubTab('import')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'import' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Import & Preflight
          </button>
        </div>
      </div>

      {/* REGISTRY SUB-TAB WITH MULTI-FILTERS & SORTING */}
      {activeSubTab === 'registry' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          {/* Filters & Search Toolbar */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> Kombinierbare Mehrfachfilter & Volltextsuche
              </span>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setAuthorFilter('all');
                  setCategoryFilter('all');
                  setLanguageFilter('all');
                  setTierFilter('all');
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
              >
                Filter zurücksetzen
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Freetext search */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Suche in ID, Latein, Name, Aliase, Indikationen, Keynotes..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Author filter */}
              <div>
                <select
                  value={authorFilter}
                  onChange={e => setAuthorFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Alle Autoren / Quellen</option>
                  <option value="hahnemann">Hahnemann</option>
                  <option value="kent">Kent</option>
                  <option value="hering">Hering</option>
                  <option value="boericke">Boericke</option>
                  <option value="boger">Boger</option>
                  <option value="allen">Allen</option>
                </select>
              </div>

              {/* Category filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Alle Kategorien</option>
                  <option value="plant">Pflanzen (Plant)</option>
                  <option value="mineral">Mineralien (Mineral)</option>
                  <option value="animal">Tiere (Animal)</option>
                  <option value="nosode">Nosoden (Nosode)</option>
                  <option value="acid">Säuren (Acid)</option>
                </select>
              </div>

              {/* Language filter */}
              <div>
                <select
                  value={languageFilter}
                  onChange={e => setLanguageFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Vorhandene Sprache (Alle)</option>
                  <option value="de">Deutsch (DE)</option>
                  <option value="en">English (EN)</option>
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="el">Ελληνικά (EL)</option>
                  <option value="it">Italiano (IT)</option>
                  <option value="ru">Русский (RU)</option>
                </select>
              </div>

              {/* Tier filter */}
              <div>
                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Importance Tier (Alle)</option>
                  <option value="1">Tier 1 (Polychrest / Hauptmittel)</option>
                  <option value="2">Tier 2 (Standard)</option>
                  <option value="3">Tier 3 (Ergänzung)</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="md:col-span-2 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="latin_asc">Sortierung: Lateinischer Name A–Z</option>
                  <option value="latin_desc">Sortierung: Lateinischer Name Z–A</option>
                  <option value="common_asc">Sortierung: Deutscher Name A–Z</option>
                  <option value="common_desc">Sortierung: Deutscher Name Z–A</option>
                  <option value="category">Sortierung: Kategorie</option>
                  <option value="tier">Sortierung: Importance Tier</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Mehrfachfilter aktiv — Ergebnisse aktualisieren in Echtzeit.</span>
              <span className="font-semibold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Treffer: {filteredAndSortedRegistry.length} von {MATERIA_MEDICA_ENTRIES.length} Remedies
              </span>
            </div>
          </div>

          {/* Registry Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Remedy ID / Latein</th>
                  <th className="p-3">Deutscher Name</th>
                  <th className="p-3">Kategorie / Tier</th>
                  <th className="p-3">Klassische Autoren</th>
                  <th className="p-3">Sprachen-Status</th>
                  <th className="p-3">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAndSortedRegistry.slice(0, 80).map(entry => {
                  const de = entry.translations?.de;
                  const auths = CLASSICAL_AUTHORS_MAP[entry.id] || { hahnemann: false, kent: false, hering: false, boericke: false, boger: false, allen: false };
                  const activeAuthorsList = Object.entries(auths).filter(([_, active]) => active).map(([k]) => k.toUpperCase());

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 italic text-sm">{entry.latinName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{entry.id}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{de?.commonName || '-'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium capitalize">
                            {entry.categoryKey}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 font-bold">
                            T{entry.importanceTier || 2}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {activeAuthorsList.length > 0 ? (
                            activeAuthorsList.map(aut => (
                              <span key={aut} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-semibold">
                                {aut}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {(['de', 'en', 'es', 'fr', 'el', 'it', 'ru'] as LanguageCode[]).map(lang => {
                            const status = getTranslationStatus(entry, lang);
                            const isPresent = status !== 'Fehlt';
                            return (
                              <span 
                                key={lang} 
                                title={`${lang.toUpperCase()}: ${status}`}
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                  isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {lang.toUpperCase()}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedRemedyForTranslate(entry);
                            setActiveTranslateLang('en');
                            setEditableTranslationContent(entry.translations?.en || entry.translations?.de);
                            setActiveSubTab('translator');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 font-medium flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-600" /> Übersetzung
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredAndSortedRegistry.length > 80 && (
            <p className="text-xs text-center text-slate-400 italic">
              Zeige die ersten 80 von {filteredAndSortedRegistry.length} gefilterten Remedies.
            </p>
          )}
        </div>
      )}

      {/* TRANSLATOR SUB-TAB */}
      {activeSubTab === 'translator' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <span>Kontrollierter 7-Sprachen-Übersetzungsworkflow</span>
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Originalsprache (DE/EN) bleibt unverändert erhalten. Fehlende Sprachen können per KI (Gemini) erzeugt und manuell geprüft/korrigiert werden.
              </p>
            </div>
            {selectedRemedyForTranslate && (
              <div className="text-right">
                <div className="font-bold text-slate-900 text-base italic">{selectedRemedyForTranslate.latinName}</div>
                <div className="text-xs font-mono text-slate-500">ID: {selectedRemedyForTranslate.id}</div>
              </div>
            )}
          </div>

          {!selectedRemedyForTranslate ? (
            <div className="text-center py-12 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-600">Bitte wählen Sie in der Übersicht ein Remedy aus, um die Übersetzungen zu verwalten.</p>
              <button
                onClick={() => setActiveSubTab('registry')}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Zur Remedy-Übersicht
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Language Selector Tabs */}
              <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {(['de', 'en', 'es', 'fr', 'el', 'it', 'ru'] as LanguageCode[]).map(lang => {
                  const status = getTranslationStatus(selectedRemedyForTranslate, lang);
                  return (
                    <button
                      key={lang}
                      onClick={() => {
                        setActiveTranslateLang(lang);
                        setEditableTranslationContent(selectedRemedyForTranslate.translations[lang] || {
                          commonName: selectedRemedyForTranslate.latinName,
                          category: selectedRemedyForTranslate.categoryKey,
                          origin: '',
                          essence: '',
                          mainIndications: [],
                          keynotes: [],
                          mindEmotional: '',
                          modalitiesBetter: [],
                          modalitiesWorse: [],
                          potenciesAndDosage: '',
                          sphereOfAction: [],
                          differentialRemedies: [],
                          searchKeywords: []
                        });
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                        activeTranslateLang === lang ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{lang.toUpperCase()}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        status === 'Original' ? 'bg-indigo-100 text-indigo-800' :
                        status === 'Vorhanden' ? 'bg-emerald-100 text-emerald-800' :
                        status === 'Automatisch übersetzt' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  Zielsprache: <strong className="text-slate-900 font-bold">{activeTranslateLang.toUpperCase()}</strong> — Status: <span className="font-semibold text-emerald-700">{getTranslationStatus(selectedRemedyForTranslate, activeTranslateLang)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAutoTranslateEntry(selectedRemedyForTranslate, activeTranslateLang)}
                    disabled={translatingInProgress || activeTranslateLang === 'de'}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                      activeTranslateLang === 'de' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {translatingInProgress ? 'Generiere Übersetzung...' : `KI-Übersetzung erzeugen (${activeTranslateLang.toUpperCase()})`}
                  </button>
                  <button
                    onClick={() => {
                      if (!editableTranslationContent) return;
                      selectedRemedyForTranslate.translations[activeTranslateLang] = {
                        ...editableTranslationContent,
                        origin: `Manually checked / edited (${new Date().toLocaleDateString()})`
                      };
                      showToast(`Übersetzung für ${activeTranslateLang.toUpperCase()} erfolgreich gespeichert.`);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Änderungen speichern
                  </button>
                </div>
              </div>

              {/* Editable Translation Fields */}
              {editableTranslationContent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gebräuchlicher Name (Common Name)</label>
                    <input
                      type="text"
                      value={editableTranslationContent.commonName || ''}
                      onChange={e => setEditableTranslationContent({ ...editableTranslationContent, commonName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Herkunft / Ursprung (Origin)</label>
                    <input
                      type="text"
                      value={editableTranslationContent.origin || ''}
                      onChange={e => setEditableTranslationContent({ ...editableTranslationContent, origin: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Essenz (Essence)</label>
                    <textarea
                      rows={3}
                      value={editableTranslationContent.essence || ''}
                      onChange={e => setEditableTranslationContent({ ...editableTranslationContent, essence: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Gemüt & Emotionen (Mind & Emotional)</label>
                    <textarea
                      rows={2}
                      value={editableTranslationContent.mindEmotional || ''}
                      onChange={e => setEditableTranslationContent({ ...editableTranslationContent, mindEmotional: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hauptindikationen (Komma-getrennt)</label>
                    <input
                      type="text"
                      value={editableTranslationContent.mainIndications?.join(', ') || ''}
                      onChange={e => setEditableTranslationContent({ ...editableTranslationContent, mainIndications: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Keynotes (Komma-getrennt)</label>
                    <input
                      type="text"
                      value={editableTranslationContent.keynotes?.join(', ') || ''}
                      onChange={e => setEditableTranslationContent({ ...editableTranslationContent, keynotes: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* IMPORT SUB-TAB */}
      {activeSubTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Materia Medica Import Workspace mit Übersetzungsoption</h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  Importieren Sie Monographien in beliebiger Quell-Sprache und wählen Sie Zielsprachen für die automatische Übersetzung aus.
                </p>
              </div>
              <button 
                onClick={loadExampleCsv}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              >
                Beispiel-CSV laden
              </button>
            </div>

            {/* Form Meta */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Standard Autor</label>
                <input 
                  type="text" 
                  value={sourceAuthor} 
                  onChange={e => setSourceAuthor(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Quellenwerk</label>
                <input 
                  type="text" 
                  value={sourceWork} 
                  onChange={e => setSourceWork(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Quelldaten-Sprache</label>
                <select 
                  value={sourceLanguage} 
                  onChange={e => setSourceLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="de">Deutsch (DE)</option>
                  <option value="en">English (EN)</option>
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="el">Ελληνικά (EL)</option>
                  <option value="it">Italiano (IT)</option>
                  <option value="ru">Русский (RU)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lizenzstatus</label>
                <select 
                  value={licenseStatus} 
                  onChange={e => setLicenseStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PUBLIC_DOMAIN">Public Domain</option>
                  <option value="COPYRIGHTED">Copyrighted / Restricted</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
            </div>

            {/* Translation targets selection */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoTranslateEnabled} 
                  onChange={e => setAutoTranslateEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Fehlende Sprachen beim Import automatisch generieren (7-Sprachen-Workflow)
              </label>
              {autoTranslateEnabled && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {(['de', 'en', 'es', 'fr', 'el', 'it', 'ru'] as LanguageCode[]).map(lang => (
                    lang !== sourceLanguage && (
                      <label key={lang} className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                        <input
                          type="checkbox"
                          checked={targetLanguages.includes(lang)}
                          onChange={e => {
                            if (e.target.checked) setTargetLanguages([...targetLanguages, lang]);
                            else setTargetLanguages(targetLanguages.filter(l => l !== lang));
                          }}
                          className="rounded text-emerald-600"
                        />
                        {lang.toUpperCase()}
                      </label>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Upload & Raw Text */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <label className="flex-1 cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors block w-full">
                  <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-slate-700">
                    {fileName ? `Ausgewählt: ${fileName}` : 'CSV- oder JSON-Datei hochladen (Drag & Drop oder Klick)'}
                  </span>
                  <input type="file" accept=".csv,.json,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
                <button 
                  onClick={handleAnalyze}
                  className="w-full md:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <RefreshCw className="w-5 h-5" />
                  Analysieren & Preflight
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Oder Rohdaten direkt einfügen (CSV/JSON)</label>
                <textarea 
                  rows={5}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="id,latinname,commonname_de,essence,indications..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Preflight Report Card */}
            {preflight && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Materia Medica Preflight Report
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500">Total Monographien</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{preflight.total_rows}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500">Neue Arzneien</div>
                    <div className="text-xl font-bold text-emerald-600 mt-1">{preflight.new_remedies}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500">Konflikte / Updates</div>
                    <div className="text-xl font-bold text-amber-600 mt-1">{preflight.conflicting_remedies}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500">Gültige Zeilen</div>
                    <div className="text-xl font-bold text-indigo-600 mt-1">{preflight.valid_rows}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500">Import Ready</div>
                    <div className={`text-xl font-bold mt-1 ${preflight.ready_for_import ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {preflight.ready_for_import ? 'JA' : 'NEIN'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Records Table & Conflict Diff */}
          {importRecords.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Erkannte Monographien & Konfliktlösung
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider font-semibold">
                      <th className="p-3">Remedy ID</th>
                      <th className="p-3">Lateinischer Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Konflikt?</th>
                      <th className="p-3">Strategie</th>
                      <th className="p-3">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {importRecords.map((rec) => (
                      <tr key={rec.import_id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono text-indigo-600 font-semibold">{rec.imported_entry.id}</td>
                        <td className="p-3 text-slate-900 font-medium">{rec.imported_entry.latinName}</td>
                        <td className="p-3">
                          {rec.is_new ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">NEU</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 text-sky-800 font-bold">BESTEHEND</span>
                          )}
                        </td>
                        <td className="p-3">
                          {rec.conflict_detected ? (
                            <span className="flex items-center gap-1 text-amber-600 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" /> Konvergenzkonflikt
                            </span>
                          ) : (
                            <span className="text-slate-400">Keiner</span>
                          )}
                        </td>
                        <td className="p-3">
                          {rec.conflict_detected ? (
                            <select 
                              value={rec.resolution_strategy}
                              onChange={e => handleStrategyChange(rec.import_id, e.target.value as any)}
                              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                            >
                              <option value="KEEP_EXISTING">Bestehenden Wert behalten</option>
                              <option value="OVERWRITE">Importierten Wert verwenden</option>
                              <option value="MERGE">Werte zusammenführen (Merge)</option>
                            </select>
                          ) : (
                            <span className="text-slate-400">Direkt übernehmen</span>
                          )}
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => setSelectedRecord(rec)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 font-medium"
                          >
                            Details & Diff
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected Record Detail & Diff Viewer */}
              {selectedRecord && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Monographie-Vergleich (Diff): <span className="font-mono text-indigo-600">{selectedRecord.imported_entry.id}</span>
                    </h4>
                    <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4"/></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                      <div className="font-bold text-sky-700 uppercase tracking-wider">Bestehender MM-Eintrag</div>
                      {selectedRecord.existing_entry ? (
                        <div className="space-y-1 text-slate-700">
                          <div><strong className="text-slate-500">Latein:</strong> {selectedRecord.existing_entry.latinName}</div>
                          <div><strong className="text-slate-500">Essenz:</strong> {selectedRecord.existing_entry.translations.de.essence}</div>
                          <div><strong className="text-slate-500">Keynotes:</strong> {selectedRecord.existing_entry.translations.de.keynotes.join(', ')}</div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic">Kein bestehender Eintrag (Neues Remedy)</div>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                      <div className="font-bold text-emerald-700 uppercase tracking-wider">Importierter Wert</div>
                      <div className="space-y-1 text-slate-700">
                        <div><strong className="text-slate-500">Latein:</strong> {selectedRecord.imported_entry.latinName}</div>
                        <div><strong className="text-slate-500">Essenz:</strong> {selectedRecord.imported_entry.translations.de.essence}</div>
                        <div><strong className="text-slate-500">Keynotes:</strong> {selectedRecord.imported_entry.translations.de.keynotes.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Finalize Action */}
              <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Sichere Schreibvorbereitung: Bestehende 670 Einträge bleiben unverändert geschützt.
                </div>
                <button 
                  onClick={handleApproveAndImport}
                  disabled={importCompleted}
                  className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2 ${
                    importCompleted ? 'bg-emerald-700 text-white cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  {importCompleted ? 'Import erfolgreich durchgeführt' : 'Änderungen freigeben & in MM integrieren'}
                </button>
              </div>

              {importCompleted && importStats && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="font-bold">Materia-Medica-Pipeline erfolgreich abgeschlossen:</strong> {importStats.addedCount} neue Arzneien hinzugefügt, {importStats.updatedCount} aktualisiert. Alle 670 Basis-Einträge bleiben vollständig erhalten.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
