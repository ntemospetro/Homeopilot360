import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { VoiceInputButton } from './VoiceInputButton';
import { X, Plus, Trash2, Check, Activity, Heart, Stethoscope, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  befundDetails?: {
    gesamtbeurteilung?: string;
    blutdruck?: string;
    puls?: string;
    temperatur?: string;
    spo2?: string;
    gewicht?: string;
    allgemeinzustand?: string;
    herzLunge?: string;
    abdomen?: string;
    hautSchleimhaeute?: string;
    neurologisch?: string;
    weitereBefunde?: string;
    customFelder?: { id: string; name: string; value: string }[];
  };
  onSave: (data: any) => void;
  patientName?: string;
}

export const FindingsWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  befundDetails = {},
  onSave,
  patientName
}) => {
  const { t } = useLanguage();
  const [details, setDetails] = useState<any>(befundDetails || {});
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDetails(befundDetails || {});
      setShowCloseConfirm(false);
      setShowDiscardConfirm(false);
    }
  }, [isOpen, befundDetails]);

  if (!isOpen) return null;

  const handleSaveAndClose = () => {
    onSave(details);
    onClose();
  };

  const handleRequestClose = () => {
    setShowCloseConfirm(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('clinicalFindings' as TranslationKey)}</h2>
              {patientName && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Patient: <span className="text-slate-700 font-semibold">{patientName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          {/* Subtitle / Description */}
          <div className="bg-teal-50/60 border border-teal-200/70 rounded-xl p-4 flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed">
              {t('clinicalFindingsDesc')}
            </p>
          </div>

          {/* Gesamtbeurteilung */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('overallAssessment')}
            </label>
            <div className="relative flex items-center">
              <select
                value={details.gesamtbeurteilung || ''}
                onChange={(e) => setDetails({ ...details, gesamtbeurteilung: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none shadow-xs"
              >
                <option value="">{t('unknown' as TranslationKey)}</option>
                <option value="Unauffällig">{t('assessmentUnremarkable')}</option>
                <option value="Leicht reduziert">{t('assessmentSlightlyReduced')}</option>
                <option value="Reduziert">{t('assessmentReduced')}</option>
                <option value="Kritisch">{t('assessmentCritical')}</option>
              </select>
              <div className="absolute right-3.5 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* 1. Vitalparameter (Top Row - 5 Vital Signs) */}
          <div className="pt-1">
            <div className="flex items-center gap-2 pb-2 mb-3.5 border-b border-slate-200">
              <Heart className="w-4 h-4 text-rose-500" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t('vitalSigns')}
              </h5>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {[
                { key: 'blutdruck', label: 'bloodPressure', phKey: 'bloodPressurePlaceholder' },
                { key: 'puls', label: 'heartRate', phKey: 'heartRatePlaceholder' },
                { key: 'temperatur', label: 'temperature', phKey: 'temperaturePlaceholder' },
                { key: 'spo2', label: 'spo2', phKey: 'spo2Placeholder' },
                { key: 'gewicht', label: 'weight', phKey: 'weightPlaceholder' }
              ].map(f => (
                <div key={f.key} className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">{t(f.label as TranslationKey)}</label>
                  <input
                    type="text"
                    id={`input-modal-vital-${f.key}`}
                    placeholder={t(f.phKey as TranslationKey)}
                    value={details[f.key] || ''}
                    onChange={(e) => setDetails({ ...details, [f.key]: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 placeholder:italic placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Untersuchungsbefund */}
          <div className="pt-2">
            <div className="flex items-center gap-2 pb-2 mb-3.5 border-b border-slate-200">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t('examinationFindings')}
              </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'allgemeinzustand', label: 'generalCondition', phKey: 'generalConditionPlaceholder' },
                { key: 'herzLunge', label: 'heartLungs', phKey: 'heartLungsPlaceholder' },
                { key: 'abdomen', label: 'abdomen', phKey: 'abdomenPlaceholder' },
                { key: 'neurologisch', label: 'neurological', phKey: 'neurologicalPlaceholder' },
                { key: 'hautSchleimhaeute', label: 'skinMucosa', phKey: 'skinMucosaPlaceholder' },
                { key: 'weitereBefunde', label: 'otherFindings', phKey: 'otherFindingsPlaceholder' }
              ].map(f => (
                <div key={f.key} className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">{t(f.label as TranslationKey)}</label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      id={`textarea-modal-finding-${f.key}`}
                      placeholder={t(f.phKey as TranslationKey)}
                      value={details[f.key] || ''}
                      onChange={(e) => setDetails({ ...details, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 pb-7 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 placeholder:italic placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow resize-y"
                    />
                    <div className="absolute bottom-2 right-2">
                      <VoiceInputButton
                        id={`voice-modal-${f.key}`}
                        value={details[f.key] || ''}
                        onChange={(val) => setDetails({ ...details, [f.key]: val })}
                        mode="append"
                        size="xs"
                        context="question_answer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Fields */}
            {details.customFelder && details.customFelder.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {details.customFelder.map((field: any, idx: number) => (
                  <div key={field.id} className="relative p-3 rounded-xl border border-slate-200 bg-slate-50 group space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newFields = [...(details.customFelder || [])];
                        newFields.splice(idx, 1);
                        setDetails({ ...details, customFelder: newFields });
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-full transition-colors shadow-xs opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      placeholder={t('customFieldName')}
                      value={field.name}
                      onChange={(e) => {
                        const newFields = [...(details.customFelder || [])];
                        newFields[idx].name = e.target.value;
                        setDetails({ ...details, customFelder: newFields });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-bold text-slate-700 placeholder:text-slate-400 placeholder:italic placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <div className="relative">
                      <textarea
                        rows={2}
                        placeholder={t('customFieldValue')}
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...(details.customFelder || [])];
                          newFields[idx].value = e.target.value;
                          setDetails({ ...details, customFelder: newFields });
                        }}
                        className="w-full px-2.5 py-2 pb-7 rounded-md border border-slate-300 bg-white text-xs text-slate-900 font-medium placeholder:text-slate-400 placeholder:italic placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-y"
                      />
                      <div className="absolute bottom-2 right-2">
                        <VoiceInputButton
                          id={`voice-modal-custom-${field.id}`}
                          value={field.value}
                          onChange={(val) => {
                            const newFields = [...(details.customFelder || [])];
                            newFields[idx].value = val;
                            setDetails({ ...details, customFelder: newFields });
                          }}
                          mode="append"
                          size="xs"
                          context="question_answer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const newFields = [...(details.customFelder || [])];
                newFields.push({ id: Math.random().toString(36).substr(2, 9), name: '', value: '' });
                setDetails({ ...details, customFelder: newFields });
              }}
              className="w-full py-2.5 px-3.5 mt-4 border border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/50 text-slate-600 hover:text-teal-700 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addCustomField')}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/80">
          <button
            type="button"
            onClick={handleRequestClose}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('btnCompleteAnamnesis')}</span>
          </button>
        </div>

        {/* Close Confirmation Dialog (identical to Questionaire) */}
        {showCloseConfirm && !showDiscardConfirm && (
          <div className="absolute inset-0 z-[200] bg-slate-900/40 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('wizardCloseTitle')}</h3>
              <p className="text-sm text-slate-600 mb-6">
                {t('wizardCloseDesc')}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveAndClose}
                  className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('wizardBtnSaveClose')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="w-full px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('wizardBtnDiscard')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('wizardBtnCancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discard Confirmation Dialog */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 z-[200] bg-slate-900/40 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-rose-600 mb-2">{t('wizardDiscardTitle')}</h3>
              <p className="text-sm text-slate-600 mb-6">
                {t('wizardDiscardDesc')}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    setShowCloseConfirm(false);
                    onClose();
                  }}
                  className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('wizardBtnConfirmDiscard')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('wizardBtnKeepEditing')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
