import React, { useState, useMemo } from 'react';
import { Users, X, Search, Phone, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { PatientCase } from '../types';
import { VoiceInputButton } from './VoiceInputButton';

interface PatientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patientCase: PatientCase) => void;
  cases: PatientCase[];
  activePatientName?: string;
}

interface GroupedPatient {
  key: string;
  name: string;
  cases: PatientCase[];
  primaryCase: PatientCase;
}

function parsePatientName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: '—', lastName: '—' };
  const trimmed = fullName.trim();
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(s => s.trim());
    return { lastName: parts[0] || '—', firstName: parts.slice(1).join(' ') || '—' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '—' };
  }
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, parts.length - 1).join(' ');
  return { firstName, lastName };
}

export const PatientSelectionModal: React.FC<PatientSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
  cases,
  activePatientName,
}) => {
  const { t, language } = useTranslation();
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Group cases by patient identity
  const groupedPatients = useMemo<GroupedPatient[]>(() => {
    const map = new Map<string, PatientCase[]>();

    cases.forEach((c) => {
      const cleanName = (c.patientName || t('patientNameLabel') || 'Patient').trim();
      const key = cleanName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(c);
    });

    const result: GroupedPatient[] = [];
    map.forEach((patientCases, key) => {
      const sortedCases = [...patientCases].sort((a, b) => {
        const da = new Date(a.anamneseDatum || a.analyzedAt || 0).getTime();
        const db = new Date(b.anamneseDatum || b.analyzedAt || 0).getTime();
        return db - da;
      });

      const primaryCase = sortedCases[0];

      result.push({
        key,
        name: primaryCase.patientName || t('patientNameLabel') || 'Patient',
        cases: sortedCases,
        primaryCase,
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name, language));
  }, [cases, language, t]);

  const modalFilteredPatients = useMemo(() => {
    if (!modalSearchQuery.trim()) return groupedPatients;
    const q = modalSearchQuery.toLowerCase().trim();
    return groupedPatients.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.primaryCase.patientBirthDate?.toLowerCase().includes(q)) return true;
      if (p.primaryCase.patientPhone?.toLowerCase().includes(q)) return true;
      if (p.primaryCase.patientEmail?.toLowerCase().includes(q)) return true;
      return p.cases.some(
        (c) =>
          c.hauptbeschwerde?.toLowerCase().includes(q) ||
          c.spontanbericht?.toLowerCase().includes(q)
      );
    });
  }, [groupedPatients, modalSearchQuery]);

  if (!isOpen) return null;

  const currentActiveKey = activePatientName ? activePatientName.trim().toLowerCase() : null;

  return (
    <div
      id="modal-patient-selection-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="modal-patient-selection-container"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 to-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {t('patientSelectionModalTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('patientSelectionModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-patient-selection-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-modal-patient-search"
              type="text"
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              placeholder={t('searchCustomerModalPlaceholder')}
              autoFocus
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {modalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setModalSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <VoiceInputButton
                value={modalSearchQuery}
                onChange={(val) => setModalSearchQuery(val)}
                size="xs"
                mode="append"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>
              {modalFilteredPatients.length} {t('patientsCountLabel')}
            </span>
            <span>{t('clickOpensFileBadge')}</span>
          </div>
        </div>

        {/* Patients Table */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {modalFilteredPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700 text-sm">{t('noPatientsFound')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('noPatientsFoundSub')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">{t('colLastName')}</th>
                    <th className="py-3 px-4">{t('colFirstName')}</th>
                    <th className="py-3 px-4">{t('colBirthDate')}</th>
                    <th className="py-3 px-4">{t('colPhone')}</th>
                    <th className="py-3 px-3 text-center">{t('colCasesCount')}</th>
                    <th className="py-3 px-4 text-right">{t('colAction')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {modalFilteredPatients.map((p) => {
                    const { firstName, lastName } = parsePatientName(p.name);
                    const isSelected = currentActiveKey === p.key;

                    return (
                      <tr
                        key={p.key}
                        onClick={() => {
                          onSelectPatient(p.primaryCase);
                        }}
                        className={`cursor-pointer transition-colors group ${
                          isSelected ? 'bg-teal-50/80 font-medium' : 'hover:bg-teal-50/40'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {lastName}
                        </td>
                        <td className="py-3 px-4 text-slate-800">
                          {firstName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {p.primaryCase.patientBirthDate ? (
                            <span>
                              {p.primaryCase.patientBirthDate}
                              {p.primaryCase.patientAge
                                ? ` (${p.primaryCase.patientAge} ${t('yearsOld')})`
                                : ''}
                            </span>
                          ) : p.primaryCase.patientAge ? (
                            <span>
                              {p.primaryCase.patientAge} {t('yearsOld')}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {p.primaryCase.patientPhone ? (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{p.primaryCase.patientPhone}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {p.cases.length}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPatient(p.primaryCase);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 group-hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('btnSelectAndTransfer')}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {modalFilteredPatients.length} {t('patientsCountLabel')}
          </span>
          <button
            type="button"
            id="btn-cancel-patient-selection"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
