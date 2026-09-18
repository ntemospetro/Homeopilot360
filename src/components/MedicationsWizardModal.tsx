import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { MedicationLiveInput, MedicationData } from './MedicationLiveInput';
import { X, Pill, Save, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nimmtMedikamente?: boolean;
  medikamenteList?: Array<MedicationData>;
  onSave: (data: { nimmtMedikamente: boolean; medikamenteList: Array<MedicationData> }) => void;
  patientName?: string;
  autoAddNew?: boolean;
}

interface MedicationItem extends MedicationData {
  _id: string;
}

const createEmptyMedication = (): MedicationItem => ({
  _id: 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
  name: '',
  dosierung: '',
  einnahmeart: '',
  isSaved: false,
  grund: '',
  wirkstoff: undefined,
  kategorie: undefined,
  nebenwirkungen: undefined,
  wechselwirkungen: undefined,
  risiken: undefined,
});

export const MedicationsWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  nimmtMedikamente = false,
  medikamenteList = [],
  onSave,
  patientName,
  autoAddNew = false
}) => {
  const { t } = useLanguage();
  const [list, setList] = useState<Array<MedicationItem>>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (medikamenteList && medikamenteList.length > 0) {
        const mapped = medikamenteList.map(m => ({
          ...m,
          isSaved: m.isSaved !== undefined ? m.isSaved : Boolean(m.name?.trim()),
          _id: (m as any)._id || ('med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9))
        }));
        const savedItems = mapped.filter(m => m.name && m.name.trim() !== '');
        const emptyItems = mapped.filter(m => !m.name || !m.name.trim());
        setList(emptyItems.length > 0 ? [...emptyItems, ...savedItems] : [createEmptyMedication(), ...savedItems]);
      } else {
        // Beim Öffnen erscheinen bereits die Felder für das erste Medikament oben
        setList([createEmptyMedication()]);
      }
      setShowCloseConfirm(false);
      setShowDiscardConfirm(false);
    }
  }, [isOpen, medikamenteList, autoAddNew]);

  if (!isOpen) return null;

  const handleSaveItem = (index: number, savedMed: MedicationData) => {
    setList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...savedMed, isSaved: true };
      const savedItems = copy.filter(m => m.name && m.name.trim() !== '' && m.isSaved);
      const activeItems = copy.filter(m => (!m.name || !m.name.trim() || !m.isSaved) && m !== copy[index]);
      
      // Always keep active input form at the top (index 0) and saved items below
      return [createEmptyMedication(), ...savedItems, ...activeItems];
    });
  };

  const handleUpdateMedication = (index: number, updated: MedicationData) => {
    setList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  const handleRemoveMedication = (index: number) => {
    setList(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      if (copy.length === 0) {
        return [createEmptyMedication()];
      }
      return copy;
    });
  };

  const handleSaveAndClose = () => {
    // Wenn alles leer bleibt, nimmt er keine Medikamente ein und es werden keine berücksichtigt
    const cleanedList = list
      .filter(m => m.name && m.name.trim() !== '')
      .map(({ _id, ...rest }) => ({ ...rest, isSaved: true }));
    const finalTakes = cleanedList.length > 0;
    onSave({
      nimmtMedikamente: finalTakes,
      medikamenteList: cleanedList
    });
    onClose();
  };

  const handleRequestClose = () => {
    const hasEnteredData = list.some(m => m.name && m.name.trim() !== '');
    if (hasEnteredData) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('medicationIntakeTitle' as TranslationKey)}</h2>
              {patientName && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Patient: <span className="text-slate-700 font-semibold">{patientName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            id="btn-close-medications-modal"
            onClick={handleRequestClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          {/* Subtitle / Description Box */}
          <div className="bg-teal-50/40 border border-teal-200/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Pill className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs flex-1">
                <p className="font-bold text-slate-800 text-sm">
                  {t('takeMedication' as TranslationKey)}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {t('addMedInfo' as TranslationKey)}
                </p>
              </div>
            </div>
          </div>

          {/* Medication List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>{t('medications' as TranslationKey)} ({list.length})</span>
              </h4>
            </div>

            <div className="space-y-3">
              {list.map((med, index) => (
                <MedicationLiveInput
                  key={med._id}
                  index={index}
                  med={med}
                  onChange={(updated) => handleUpdateMedication(index, updated)}
                  onRemove={() => handleRemoveMedication(index)}
                  onSaveItem={(saved) => handleSaveItem(index, saved)}
                  showResearchDetails={false}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/80">
          <button
            type="button"
            id="btn-cancel-medications-modal"
            onClick={handleRequestClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            id="btn-save-medications-modal"
            onClick={handleSaveAndClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('btnCompleteAnamnesis')}</span>
          </button>
        </div>

        {/* Close Confirmation Dialog */}
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
