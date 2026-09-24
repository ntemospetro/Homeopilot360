import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Languages, Search, CheckCircle, Globe } from 'lucide-react';

export const AdminTranslationStudio: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Translation Studio</span>
          </div>
          <h2 className="text-xl font-bold">Übersetzungs- & Lokalisierungs-Verwaltung</h2>
          <p className="text-xs text-slate-400 mt-1">
            Repertorium, Materia Medica & Systemtexte in allen 7 Sprachen synchronisiert.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-teal-300">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>Alle 7 Sprachen aktiv ({currentLanguage.toUpperCase()})</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Übersetzungsschlüssel oder Begriff suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
          <Languages className="w-5 h-5 text-teal-600 shrink-0" />
          <span>
            Das Übersetzungssystem verwaltet mehr als 89.000 Begriffe für DE, EN, ES, FR, IT, RU und EL. Alle Module greifen automatisch auf die zentralen Lokalisierungsdateien zu.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminTranslationStudio;
