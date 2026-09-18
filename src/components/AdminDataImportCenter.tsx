import React, { useState } from 'react';
import { AdminRepertoryImportModule } from './AdminRepertoryImportModule';
import { AdminMateriaMedicaImportModule } from './AdminMateriaMedicaImportModule';
import { BookOpen, Database, Layers } from 'lucide-react';

export const AdminDataImportCenter: React.FC = () => {
  const [pipelineTab, setPipelineTab] = useState<'repertory' | 'materia_medica'>('repertory');

  return (
    <div className="space-y-6">
      {/* Top Level Pipeline Switcher */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Daten-Import & Preflight Center</h1>
            <p className="text-xs text-slate-400">Getrennte Pipelines für Repertorium und Materia Medica nach strengen Architekturvorgaben.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setPipelineTab('repertory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              pipelineTab === 'repertory'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. Repertorium Pipeline
          </button>
          <button
            onClick={() => setPipelineTab('materia_medica')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              pipelineTab === 'materia_medica'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            2. Materia Medica Pipeline
          </button>
        </div>
      </div>

      {/* Render Active Pipeline */}
      {pipelineTab === 'repertory' ? (
        <AdminRepertoryImportModule />
      ) : (
        <AdminMateriaMedicaImportModule />
      )}
    </div>
  );
};
