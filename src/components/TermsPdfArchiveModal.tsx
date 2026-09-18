import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Scale, 
  Globe, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  FileDown, 
  Sparkles,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { 
  getTermsPdfArchive, 
  deleteTermsPdfArchiveItem, 
  deleteTermsPdfArchiveGroup, 
  archiveCurrentTermsForAllLanguages 
} from '../services/storage';
import { exportTermsToPDF } from '../services/pdfExportService';
import { TermsPdfArchiveItem, LanguageCode } from '../types';
import { LANGUAGES } from '../i18n/translations';
import { useTranslation } from '../i18n/LanguageContext';

interface TermsPdfArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArchiveCreated?: () => void;
}

export const TermsPdfArchiveModal: React.FC<TermsPdfArchiveModalProps> = ({
  isOpen,
  onClose,
  onArchiveCreated,
}) => {
  const { t } = useTranslation();
  const [archiveItems, setArchiveItems] = useState<TermsPdfArchiveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLangFilter, setSelectedLangFilter] = useState<'all' | LanguageCode>('all');
  const [previewItem, setPreviewItem] = useState<TermsPdfArchiveItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadArchive = () => {
    setArchiveItems(getTermsPdfArchive());
  };

  useEffect(() => {
    if (isOpen) {
      loadArchive();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      loadArchive();
    };
    window.addEventListener('homoeo_terms_pdf_archive_updated', handleUpdate);
    return () => window.removeEventListener('homoeo_terms_pdf_archive_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateNewBatch = () => {
    const created = archiveCurrentTermsForAllLanguages();
    loadArchive();
    showToast(t('termsPdfArchiveCreatedSuccess'));
    if (onArchiveCreated) {
      onArchiveCreated();
    }
  };

  const handleDownloadSingle = (item: TermsPdfArchiveItem) => {
    exportTermsToPDF({
      title: item.title,
      lastUpdated: item.lastUpdated,
      version: item.version,
      content: item.content,
      language: item.language,
    }, { download: true });
    showToast(`${item.title} (${item.language.toUpperCase()}) PDF heruntergeladen.`);
  };

  const handleDownloadGroup = (versionGroup: string, version: string) => {
    const groupItems = archiveItems.filter(item => item.versionGroup === versionGroup);
    groupItems.forEach((item, index) => {
      setTimeout(() => {
        exportTermsToPDF({
          title: item.title,
          lastUpdated: item.lastUpdated,
          version: item.version,
          content: item.content,
          language: item.language,
        }, { download: true });
      }, index * 250);
    });
    showToast(`Alle 7 Sprachversionen für Version ${version} werden heruntergeladen...`);
  };

  const handleDeleteItem = (item: TermsPdfArchiveItem) => {
    if (window.confirm(t('termsPdfArchiveConfirmDelete', { title: item.title, lang: item.language.toUpperCase() }))) {
      deleteTermsPdfArchiveItem(item.id);
      loadArchive();
      if (previewItem?.id === item.id) {
        setPreviewItem(null);
      }
      showToast(t('termsPdfArchiveDeletedSuccess'));
    }
  };

  const handleDeleteGroup = (versionGroup: string, version: string) => {
    if (window.confirm(t('termsPdfArchiveConfirmDeleteGroup', { version }))) {
      deleteTermsPdfArchiveGroup(versionGroup);
      loadArchive();
      if (previewItem?.versionGroup === versionGroup) {
        setPreviewItem(null);
      }
      showToast(t('termsPdfArchiveGroupDeletedSuccess'));
    }
  };

  // Filtering
  const filteredItems = archiveItems.filter(item => {
    if (selectedLangFilter !== 'all' && item.language !== selectedLangFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchVer = item.version.toLowerCase().includes(q);
      const matchStand = item.lastUpdated.toLowerCase().includes(q);
      const matchLang = item.language.toLowerCase().includes(q);
      if (!matchTitle && !matchVer && !matchStand && !matchLang) {
        return false;
      }
    }
    return true;
  });

  const getLanguageDetails = (code: LanguageCode) => {
    return LANGUAGES.find(l => l.code === code) || {
      code,
      label: code.toUpperCase(),
      nativeName: code.toUpperCase(),
      englishName: code.toUpperCase(),
      flag: '🌐'
    };
  };

  const formatDateTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const renderFormattedPreview = (content: string) => {
    const lines = (content || '').split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-slate-900 mt-4 mb-1 pb-1 border-b border-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-3 rounded-full bg-teal-600 inline-block" />
            <span>{trimmed.replace('### ', '')}</span>
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-slate-950 mt-4 mb-2">
            {trimmed.replace('## ', '')}
          </h3>
        );
      }
      if (trimmed === '---') {
        return <hr key={idx} className="my-2 border-slate-200" />;
      }
      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 text-xs my-1">
            {trimmed.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-1">
          {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
        </p>
      );
    });
  };

  return (
    <div 
      id="terms-pdf-archive-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-800 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div 
        id="terms-pdf-archive-modal-card"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
              <FolderArchive className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30">
                  {t('termsPdfArchiveTotalCount', { count: archiveItems.length })}
                </span>
                <span className="text-xs text-slate-400">
                  7 {t('termsPdfArchiveColLanguage')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {t('termsPdfArchiveModalTitle')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-archive-create-all-languages"
              onClick={handleCreateNewBatch}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Snapshot der aktuellen AGB für alle 7 Sprachen archivieren"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('termsPdfArchiveBtnCreateAll')}</span>
              <span className="sm:hidden">{t('termsPdfArchiveSaveAllBtn')}</span>
            </button>

            <button
              id="btn-close-terms-archive-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('termsPdfArchiveClose')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Language filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              id="btn-filter-lang-all"
              onClick={() => setSelectedLangFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedLangFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {t('termsPdfArchiveFilterAll')} ({archiveItems.length})
            </button>

            {LANGUAGES.map(lang => {
              const count = archiveItems.filter(i => i.language === lang.code).length;
              return (
                <button
                  key={lang.code}
                  id={`btn-filter-lang-${lang.code}`}
                  onClick={() => setSelectedLangFilter(lang.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
                    selectedLangFilter === lang.code
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.code.toUpperCase()}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-terms-archive"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('termsPdfArchiveSearchPlaceholder')}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-teal-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body: Table or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100/60">
          {archiveItems.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 shadow-xs max-w-xl mx-auto my-6">
              <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-3 text-teal-600">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t('termsPdfArchiveEmptyTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {t('termsPdfArchiveEmptySubtitle')}
              </p>
              <button
                id="btn-archive-initial-batch"
                onClick={handleCreateNewBatch}
                className="mt-5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>{t('termsPdfArchiveBtnCreateAll')}</span>
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-lg border border-slate-200 text-slate-500 text-xs">
              Keine passenden archivierten AGB-PDFs für die aktuellen Filter gefunden.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3.5">{t('termsPdfArchiveColVersion')}</th>
                      <th className="py-3 px-3.5">{t('termsPdfArchiveColLanguage')}</th>
                      <th className="py-3 px-3.5">{t('termsPdfArchiveColTitle')}</th>
                      <th className="py-3 px-3.5">{t('termsPdfArchiveColStand')}</th>
                      <th className="py-3 px-3.5">{t('termsPdfArchiveColCreatedAt')}</th>
                      <th className="py-3 px-3.5">{t('termsPdfArchiveColScope')}</th>
                      <th className="py-3 px-3.5 text-right">{t('termsPdfArchiveColActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredItems.map((item) => {
                      const langDetails = getLanguageDetails(item.language);
                      return (
                        <tr 
                          key={item.id}
                          className="hover:bg-teal-50/40 transition-colors"
                        >
                          {/* Version Badge */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/80">
                              v{item.version}
                            </span>
                          </td>

                          {/* Language */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base leading-none">{langDetails.flag}</span>
                              <div>
                                <span className="font-bold text-slate-900">{langDetails.code.toUpperCase()}</span>
                                <span className="text-[10px] text-slate-500 block">{langDetails.label}</span>
                              </div>
                            </div>
                          </td>

                          {/* Title */}
                          <td className="py-3 px-3.5 min-w-[200px]">
                            <div className="font-semibold text-slate-900 line-clamp-1">
                              {item.title}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.pdfFilename || `AGB_v${item.version}_${item.language.toUpperCase()}.pdf`}
                            </span>
                          </td>

                          {/* Stand / Gültigkeit */}
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-700">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.lastUpdated}</span>
                            </div>
                          </td>

                          {/* Created At */}
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                            {formatDateTime(item.createdAt)}
                          </td>

                          {/* Scope / Umfang */}
                          <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-600">
                            <span>{t('termsPdfArchiveSections', { count: item.sectionCount })}</span>
                            <span className="text-slate-400 mx-1">•</span>
                            <span>{t('termsPdfArchiveWords', { count: item.wordCount })}</span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Download PDF button */}
                              <button
                                id={`btn-download-pdf-${item.id}`}
                                onClick={() => handleDownloadSingle(item)}
                                className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                title={t('termsPdfArchiveBtnDownload')}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>

                              {/* Preview text */}
                              <button
                                id={`btn-preview-terms-${item.id}`}
                                onClick={() => setPreviewItem(item)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                title={t('termsPdfArchiveBtnPreview')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                id={`btn-delete-terms-${item.id}`}
                                onClick={() => handleDeleteItem(item)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title={t('termsPdfArchiveBtnDelete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-600" />
            <span>Alle PDF-Exporte enthalten Kopfzeilen mit Titel, Gültigkeitsdatum/Stand, Versionsnummer und Seitenzahlen im Format (1/3, 2/3 etc.).</span>
          </div>
          <button
            id="btn-close-archive-modal-bottom"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold text-xs transition-colors cursor-pointer"
          >
            {t('termsPdfArchiveClose')}
          </button>
        </div>
      </div>

      {/* Sub-modal: Preview of single item */}
      {previewItem && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-300 uppercase">
                  {t('termsPdfArchivePreviewTitle')} • {previewItem.language.toUpperCase()} (v{previewItem.version})
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{previewItem.title}</h3>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Stand: {previewItem.lastUpdated} • Archiviert: {formatDateTime(previewItem.createdAt)}
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[55vh] text-xs bg-slate-50">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                {renderFormattedPreview(previewItem.content)}
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleDownloadSingle(previewItem)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('termsPdfArchiveBtnDownload')}</span>
              </button>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold text-xs cursor-pointer"
              >
                {t('termsPdfArchiveClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
