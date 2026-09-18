import React, { useState, useEffect, useRef } from 'react';
import { anamnesisSchema } from '../data/anamnesisSchema';
import translatedDicts from '../data/anamnesisTranslations.json';
import { AnamnesisStepConfig, AnamnesisField } from '../types.extendedAnamnesis';
import { useLanguage } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { VoiceInputButton } from './VoiceInputButton';
import { MedicationLiveInput, MedicationData } from './MedicationLiveInput';
import { MedicationsWizardModal } from './MedicationsWizardModal';
import { 
  X, ArrowRight, ArrowLeft, Plus, Trash2, Save, CheckCircle2, Check,
  Pill, ExternalLink, ClipboardList, Database, CornerDownRight, AlertCircle
} from 'lucide-react';

export interface MedicationItem extends MedicationData {
  _id: string;
}

export const createEmptyMedication = (): MedicationItem => ({
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSave: (data: any, updatedMeds?: Array<MedicationData>) => void;
  patientName?: string;
  nimmtMedikamente?: boolean;
  medikamenteList?: Array<MedicationData>;
}

export const ExtendedAnamnesisWizard: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onSave, 
  patientName,
  nimmtMedikamente = false,
  medikamenteList = []
}) => {
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [values, setValues] = useState<any>(initialData || {});
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setShowCloseConfirm(false);
      setShowDiscardConfirm(false);

      const base = { ...(initialData || {}) };
      const existingMeds = (base.medikamente_liste && Array.isArray(base.medikamente_liste) && base.medikamente_liste.length > 0)
        ? base.medikamente_liste
        : (medikamenteList && medikamenteList.length > 0)
        ? medikamenteList
        : [];
      const hasMeds = existingMeds.length > 0 || nimmtMedikamente || base.nimmt_medikamente === 'Ja';

      setValues({
        ...base,
        nimmt_medikamente: base.nimmt_medikamente || (hasMeds ? 'Ja' : undefined),
        medikamente_liste: existingMeds.map((m: any, idx: number) => ({
          _id: m._id || `med_${idx}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...m,
          isSaved: m.isSaved !== undefined ? m.isSaved : Boolean(m.name?.trim())
        }))
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialData, medikamenteList, nimmtMedikamente]);

  if (!isOpen) return null;

  const actualDicts = (translatedDicts as any).default || translatedDicts;
  const dict = language === 'de' ? {} : (actualDicts[language] || actualDicts['en'] || {});
  const tSchema = (text: string) => dict[text] || text;
  const steps = anamnesisSchema;
  const currentStepConfig = steps[currentStep];

  const getCleanMeds = (vals: any): MedicationData[] => {
    if (vals.nimmt_medikamente === 'Nein') {
      return [];
    }
    const list = Array.isArray(vals.medikamente_liste) ? vals.medikamente_liste : [];
    return list
      .filter((m: any) => m && m.name && m.name.trim() !== '')
      .map(({ _id, ...rest }: any) => ({ ...rest, isSaved: true }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const cleanMeds = getCleanMeds(values);
      onSave(values, cleanMeds);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const cleanMeds = getCleanMeds(values);
      onSave(values, cleanMeds);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveAndExit = () => {
    const cleanMeds = getCleanMeds(values);
    onSave(values, cleanMeds);
    onClose();
  };

  const updateValue = (fieldId: string, value: any) => {
    setValues((prev: any) => {
      const updated = { ...prev, [fieldId]: value };

      // Recursively clean up dependent values when the parent question changes
      const cleanupDependents = (changedId: string) => {
        steps.forEach((step) => {
          step.fields.forEach((f) => {
            if (f.condition?.fieldId === changedId) {
              const parentVal = updated[changedId];
              let conditionMet = false;
              if (f.condition.operator === 'includes') {
                conditionMet = Array.isArray(parentVal) && parentVal.includes(f.condition.value);
              } else {
                conditionMet = parentVal === f.condition.value;
              }

              if (!conditionMet) {
                delete updated[f.id];
                cleanupDependents(f.id);
              }
            }
          });
        });
      };

      cleanupDependents(fieldId);
      return updated;
    });
  };

  const isConditionMet = (field: AnamnesisField): boolean => {
    if (!field.condition) return true;

    // Verify parent field's own condition is met (supporting nested hierarchies)
    const parentField = currentStepConfig.fields.find((f) => f.id === field.condition?.fieldId);
    if (parentField && !isConditionMet(parentField)) {
      return false;
    }

    const val = values[field.condition.fieldId];
    if (field.condition.operator === 'includes') {
      return Array.isArray(val) && val.includes(field.condition.value);
    }
    return val === field.condition.value;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('extAnamnesisTitle')}</h2>
              {patientName && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Patient: <span className="text-slate-700 font-semibold">{patientName}</span>
                </p>
              )}
            </div>
          </div>
          <button 
            type="button"
            id="btn-close-extended-anamnesis-modal"
            onClick={() => setShowCloseConfirm(true)} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold">
                {t('stepProgress' as any)?.replace('{current}', String(currentStep + 1)).replace('{total}', String(steps.length)) || `Schritt ${currentStep + 1} von ${steps.length}`}
              </span>
              <span className="text-slate-800 font-bold">{tSchema(currentStepConfig.title)}</span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              {tSchema(currentStepConfig.title)}
            </h3>
            
            {(() => {
              const stepFieldIds = new Set(currentStepConfig.fields.map(f => f.id));
              const childFieldIds = new Set(
                currentStepConfig.fields
                  .filter(f => f.condition && stepFieldIds.has(f.condition.fieldId))
                  .map(f => f.id)
              );
              const rootFields = currentStepConfig.fields.filter(f => !childFieldIds.has(f.id) && isConditionMet(f));

              return (
                <div className="space-y-4">
                  {rootFields.map((field, rootIndex) => (
                    <FieldRenderer 
                      key={field.id} 
                      field={field}
                      index={rootIndex}
                      category={currentStepConfig.title}
                      values={values} 
                      allStepFields={currentStepConfig.fields}
                      onChange={(val) => updateValue(field.id, val)} 
                      isConditionMet={isConditionMet}
                      onUpdateValue={updateValue}
                      onOpenMedModal={() => setIsMedModalOpen(true)}
                      patientName={patientName}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            id="btn-back-extended-anamnesis"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs ${
              currentStep === 0 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btnStepBack')}</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              id="btn-next-extended-anamnesis"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span>{t('btnStepNext')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-save-extended-anamnesis"
              onClick={handleSaveAndExit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('btnCompleteAnamnesis')}</span>
            </button>
          )}
        </div>
      
        {/* Fullscreen Medications Modal overlay if opened via "Im Dialog bearbeiten" */}
        {isMedModalOpen && (
          <MedicationsWizardModal
            isOpen={isMedModalOpen}
            onClose={() => setIsMedModalOpen(false)}
            patientName={patientName}
            nimmtMedikamente={values.nimmt_medikamente === 'Ja'}
            medikamenteList={values.medikamente_liste || []}
            onSave={(result) => {
              const newMeds = result.medikamenteList;
              const hasMeds = result.nimmtMedikamente;
              const updatedVals = {
                ...values,
                nimmt_medikamente: hasMeds ? 'Ja' : 'Nein',
                medikamente_liste: newMeds
              };
              setValues(updatedVals);
              const cleanMeds = getCleanMeds(updatedVals);
              onSave(updatedVals, cleanMeds);
              setIsMedModalOpen(false);
            }}
          />
        )}

        {/* Close Confirmation Dialog */}
        {showCloseConfirm && !showDiscardConfirm && (
          <div className="absolute inset-0 z-[200] bg-slate-900/40 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('wizardCloseTitle' as any) || 'Fortschritt speichern?'}</h3>
              <p className="text-sm text-slate-600 mb-6">
                {t('wizardCloseDesc' as any) || 'Möchten Sie die bisherigen Antworten speichern, bevor Sie den Fragebogen schließen?'}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnSaveClose' as any) || 'Speichern & Schließen'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="w-full px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnDiscard' as any) || 'Nicht speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnCancel' as any) || 'Abbrechen'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discard Confirmation Dialog */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 z-[200] bg-slate-900/40 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-rose-600 mb-2">{t('wizardDiscardTitle' as any) || 'Sind Sie sicher?'}</h3>
              <p className="text-sm text-slate-600 mb-6">
                {t('wizardDiscardDesc' as any) || 'Alle ungespeicherten Eingaben in diesem Fragebogen gehen dauerhaft verloren.'}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnConfirmDiscard' as any) || 'Ja, verwerfen'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    setShowCloseConfirm(false);
                  }}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnKeepEditing' as any) || 'Weiter bearbeiten'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted Field Renderer to handle recursion easily
const FieldRenderer: React.FC<{ 
  field: AnamnesisField, 
  values: any, 
  onChange: (val: any) => void, 
  isConditionMet: (f: AnamnesisField) => boolean,
  index?: number,
  category?: string,
  isNested?: boolean,
  onUpdateValue?: (fieldId: string, val: any) => void,
  onOpenMedModal?: () => void,
  patientName?: string,
  allStepFields?: AnamnesisField[]
}> = ({ 
  field, 
  values, 
  onChange, 
  isConditionMet, 
  index = 0, 
  category = '', 
  isNested = false,
  onUpdateValue,
  onOpenMedModal,
  patientName,
  allStepFields
}) => {
  const { language, t } = useLanguage();
  const actualDicts = (translatedDicts as any).default || translatedDicts;
  const dict = language === 'de' ? {} : (actualDicts[language] || actualDicts['en'] || {});
  const tSchema = (text: string) => dict[text] || text;
  
  if (!isConditionMet(field)) return null;

  const value = values[field.id];
  const isAnswered = value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);

  // Find direct conditional child fields that belong underneath this field
  const directChildren = allStepFields 
    ? allStepFields.filter(f => f.condition?.fieldId === field.id) 
    : [];

  const innerContent = () => {
    // Specialized medication list renderer matching image.png & step 5
    if (field.id === 'medikamente_liste') {
      const rawList: MedicationItem[] = Array.isArray(value) && value.length > 0 
        ? value 
        : [createEmptyMedication()];
      const savedMeds = rawList.filter(m => m.name && m.name.trim() !== '');
      const emptyMeds = rawList.filter(m => !m.name || !m.name.trim());
      const list: MedicationItem[] = emptyMeds.length > 0 ? [...emptyMeds, ...savedMeds] : [createEmptyMedication(), ...savedMeds];

      const handleSaveItem = (idx: number, savedItem: MedicationData) => {
        const updated: MedicationItem[] = [...list];
        updated[idx] = { 
          ...updated[idx], 
          ...savedItem,
          isSaved: true,
          _id: (updated[idx] as any)?._id || (savedItem as any)?._id || `med_${idx}`
        };
        const saved = updated.filter(m => m.name && m.name.trim() !== '' && m.isSaved);
        const active = updated.filter(m => (!m.name || !m.name.trim() || !m.isSaved) && m !== updated[idx]);
        const finalUpdated = [createEmptyMedication(), ...saved, ...active];
        onChange(finalUpdated);
      };

      const handleUpdateMed = (idx: number, updatedItem: MedicationData) => {
        const updated: MedicationItem[] = [...list];
        updated[idx] = { 
          ...updated[idx], 
          ...updatedItem,
          _id: (updated[idx] as any)?._id || (updatedItem as any)?._id || `med_${idx}`
        };
        onChange(updated);
      };

      const handleRemoveMed = (idx: number) => {
        const updated = list.filter((_, i) => i !== idx);
        onChange(updated.length === 0 ? [createEmptyMedication()] : updated);
      };

      const validMedsCount = list.filter(m => m.name && m.name.trim().length > 0).length;

      return (
        <div className="space-y-4">
          {/* Subtitle / Description Box matching image.png */}
          <div className="bg-teal-50/40 border border-teal-200/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs flex-1">
                <p className="font-bold text-slate-800 text-sm">
                  {t('takeMedication' as TranslationKey) || 'Welche Medikamente nehmen Sie derzeit?'}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {t('addMedInfo' as TranslationKey) || 'Hier können Sie die aktuelle Medikation erfassen. Bleiben alle Felder leer, werden keine Medikamente berücksichtigt.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>{t('medications' as TranslationKey) || 'Medikamente'} ({validMedsCount || list.length})</span>
            </h4>
            <div className="flex items-center gap-2">
              {onOpenMedModal && (
                <button
                  type="button"
                  id="btn-open-med-modal-from-anamnesis"
                  onClick={onOpenMedModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 cursor-pointer shadow-2xs"
                  title={t('btnOpenInDialog' as TranslationKey) || 'Im Dialog bearbeiten'}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('btnOpenInDialog' as TranslationKey) || 'Im Dialog bearbeiten'}</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Medication Cards */}
          <div className="space-y-3">
            {list.map((med: any, medIdx: number) => (
              <MedicationLiveInput
                key={med._id || `med_${medIdx}`}
                index={medIdx}
                med={med}
                onChange={(updated) => handleUpdateMed(medIdx, updated)}
                onRemove={() => handleRemoveMed(medIdx)}
                onSaveItem={(saved) => handleSaveItem(medIdx, saved)}
                showResearchDetails={false}
                t={t}
              />
            ))}
          </div>
        </div>
      );
    }

    if (field.type === 'conditional_group') {
      return (
        <div className="pl-4 border-l-2 border-teal-100 space-y-4 mt-2">
          {field.subFields?.map((sub, subIdx) => (
            <div key={sub.id} className="space-y-2">
              <label className="block text-sm font-bold text-slate-800">{tSchema(sub.label)}</label>
              <FieldRenderer 
                field={sub} 
                values={values[field.id] || {}} 
                onChange={(val) => {
                  const currentObj = values[field.id] || {};
                  onChange({ ...currentObj, [sub.id]: val });
                }} 
                isConditionMet={() => true} 
                isNested={true}
                onUpdateValue={onUpdateValue}
                onOpenMedModal={onOpenMedModal}
                patientName={patientName}
              />
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'dynamic_list') {
      const list = Array.isArray(value) ? value : (isNested ? [{}] : []);
      const rawAddLabel = field.addLabel ? tSchema(field.addLabel) : tSchema('+ Hinzufügen');
      const cleanAddLabel = rawAddLabel.replace(/^\+\s*/, '');

      return (
        <div className="space-y-4">
          {isNested && field.label && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">{tSchema(field.label)}</span>
            </div>
          )}
          {list.map((item: any, i: number) => (
            <div key={i} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 relative group">
              <button
                type="button"
                id={`btn-remove-dynamic-${field.id}-${i}`}
                onClick={() => {
                  const newList = [...list];
                  newList.splice(i, 1);
                  onChange(newList);
                }}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 opacity-70 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                title={t('remove' as TranslationKey) || 'Entfernen'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="space-y-4 pr-8">
                {field.subFields?.map(sub => (
                  <div key={sub.id} className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">{tSchema(sub.label)}</label>
                    {sub.type === 'radio' && sub.options && (() => {
                      const isSubYesNo = sub.options.length === 2 &&
                        ((sub.options.includes('Ja') && sub.options.includes('Nein')) ||
                         (sub.options.includes('Nein') && sub.options.includes('Ja')));
                      const displaySubOpts = isSubYesNo ? ['Nein', 'Ja'] : sub.options;
                      const isSubRow = displaySubOpts.length === 2 || (displaySubOpts.length <= 5 && displaySubOpts.every(o => o.length <= 16));
                      const subGridClass = displaySubOpts.length === 2
                        ? "grid grid-cols-2 gap-2"
                        : isSubRow
                          ? displaySubOpts.length === 3 ? "grid grid-cols-3 gap-2" : displaySubOpts.length === 4 ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 sm:grid-cols-4 gap-2"
                          : "space-y-1.5";

                      return (
                        <div className={subGridClass}>
                          {displaySubOpts.map((opt, oIdx) => {
                            const isSelected = item[sub.id] === opt;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                id={`btn-sub-${field.id}-${i}-${sub.id}-${String(opt).toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                                onClick={() => {
                                  const newList = [...list];
                                  newList[i] = { ...newList[i], [sub.id]: opt };
                                  onChange(newList);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-teal-50 border-teal-600 text-teal-950 font-semibold shadow-2xs'
                                    : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'border-teal-600 bg-teal-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <span className="leading-snug truncate">{tSchema(opt)}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                    {sub.type === 'checkbox' && sub.options && (
                      <div className="space-y-1.5">
                        {sub.options.map((opt, oIdx) => {
                          const currentArr = Array.isArray(item[sub.id]) ? [...item[sub.id]] : [];
                          const isSelected = currentArr.includes(opt);
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              id={`btn-sub-check-${field.id}-${i}-${sub.id}-${oIdx}`}
                              onClick={() => {
                                if (isSelected) {
                                  const idxToRemove = currentArr.indexOf(opt);
                                  if (idxToRemove > -1) currentArr.splice(idxToRemove, 1);
                                } else {
                                  currentArr.push(opt);
                                }
                                const newList = [...list];
                                newList[i] = { ...newList[i], [sub.id]: currentArr };
                                onChange(newList);
                              }}
                              className={`w-full text-left p-2 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                                isSelected
                                  ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                                  : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'border-teal-600 bg-teal-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="leading-snug text-xs">{tSchema(opt)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {(sub.type === 'text' || sub.type === 'number') && (
                      <div className="relative flex items-center">
                        <input
                          type={sub.type}
                          placeholder={sub.placeholder ? tSchema(sub.placeholder) : ''}
                          value={item[sub.id] || ''}
                          onChange={(e) => {
                            const newList = [...list];
                            newList[i] = { ...newList[i], [sub.id]: e.target.value };
                            onChange(newList);
                          }}
                          className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                        />
                        {sub.type === 'text' && (
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                            <VoiceInputButton
                              value={item[sub.id] || ''}
                              onChange={(val) => {
                                const newList = [...list];
                                newList[i] = { ...newList[i], [sub.id]: val };
                                onChange(newList);
                              }}
                              size="xs"
                              mode="append"
                              context="question_answer"
                              id={`btn-voice-sub-${field.id}-${i}-${sub.id}`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {sub.type === 'textarea' && (
                      <div className="relative flex items-center">
                        <textarea
                          placeholder={sub.placeholder ? tSchema(sub.placeholder) : ''}
                          value={item[sub.id] || ''}
                          onChange={(e) => {
                            const newList = [...list];
                            newList[i] = { ...newList[i], [sub.id]: e.target.value };
                            onChange(newList);
                          }}
                          className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors min-h-[70px]"
                        />
                        <div className="absolute right-1.5 top-2.5">
                          <VoiceInputButton
                            value={item[sub.id] || ''}
                            onChange={(val) => {
                              const newList = [...list];
                              newList[i] = { ...newList[i], [sub.id]: val };
                              onChange(newList);
                            }}
                            size="xs"
                            mode="append"
                            context="question_answer"
                            id={`btn-voice-sub-${field.id}-${i}-${sub.id}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            id={`btn-add-dynamic-${field.id}`}
            onClick={() => onChange([...list, {}])}
            className="flex items-center justify-center w-full gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 py-3 px-4 rounded-xl transition-colors border border-teal-200 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>{cleanAddLabel}</span>
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2 pt-1">
        {isNested && field.label && (
          <label className="block text-xs font-bold text-slate-800">{tSchema(field.label)}</label>
        )}
        
        {/* Radio Options - Yes/No side-by-side or orderly grid */}
        {field.type === 'radio' && field.options && (() => {
          const isYesNo = field.options.length === 2 && 
            ((field.options.includes('Ja') && field.options.includes('Nein')) ||
             (field.options.includes('Nein') && field.options.includes('Ja')));

          // User explicitly requested: "In dem Popup sollen immer nein und ja nebeneinander liegen."
          // For Yes/No options: Nein on left, Ja on right
          const displayOptions = isYesNo ? ['Nein', 'Ja'] : field.options;
          const isTwoOptions = displayOptions.length === 2;
          const isShortRow = displayOptions.length <= 5 && displayOptions.every(o => o.length <= 20);

          const gridClass = isTwoOptions
            ? "grid grid-cols-2 gap-3"
            : isShortRow
              ? displayOptions.length === 3
                ? "grid grid-cols-3 gap-2"
                : displayOptions.length === 4
                  ? "grid grid-cols-4 gap-2"
                  : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
              : "space-y-1.5";

          return (
            <div className={gridClass}>
              {displayOptions.map((opt, oIdx) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    id={`btn-opt-${field.id}-${String(opt).toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => {
                      onChange(opt);
                      if (field.id === 'nimmt_medikamente' && opt === 'Ja') {
                        const currentMeds = values.medikamente_liste;
                        if (!currentMeds || !Array.isArray(currentMeds) || currentMeds.length === 0) {
                          onUpdateValue?.('medikamente_liste', [createEmptyMedication()]);
                        }
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between sm:justify-start gap-2.5 ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-500/20'
                        : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="leading-snug font-medium truncate">{tSchema(opt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {field.type === 'checkbox' && field.options && (
          <div className="space-y-1.5">
            {field.options.map((opt, oIdx) => {
              const currentArr = Array.isArray(value) ? [...value] : [];
              const isSelected = currentArr.includes(opt);
              return (
                <button
                  key={oIdx}
                  type="button"
                  id={`btn-check-${field.id}-${String(opt).toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => {
                    if (isSelected) {
                      const idxToRemove = currentArr.indexOf(opt);
                      if (idxToRemove > -1) currentArr.splice(idxToRemove, 1);
                    } else {
                      currentArr.push(opt);
                    }
                    onChange(currentArr);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                    isSelected
                      ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                      : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="leading-snug">{tSchema(opt)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Rating scale buttons for number fields asking for a scale (e.g. 0-10, 1-10) */}
        {field.type === 'number' && (field.id === 'intensitaet' || field.label?.includes('Skala') || field.label?.includes('0–10') || field.label?.includes('1–10')) ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase">
              <span>0 ({t('scaleMinimal')})</span>
              <span className="font-mono text-teal-700 text-xs font-bold">
                {value !== undefined && value !== '' ? `${t('scaleSelectedValue')}: ${value}` : ''}
              </span>
              <span>10 ({t('scaleExtrem')})</span>
            </div>
            <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = String(value) === String(num);
                return (
                  <button
                    key={num}
                    type="button"
                    id={`btn-scale-rating-${field.id}-${num}`}
                    onClick={() => onChange(num)}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-300'
                        : 'bg-slate-50 hover:bg-teal-50 text-slate-700 border border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        ) : field.type === 'number' ? (
          <div className="flex items-center gap-2 pt-0.5">
            <div className="relative flex items-center w-36 sm:w-44">
              <input
                type="number"
                min={0}
                placeholder={field.placeholder ? tSchema(field.placeholder) : '0'}
                value={value !== undefined && value !== null ? value : ''}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 pr-14 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
              />
              {field.unit && (
                <span className="absolute right-2 text-[11px] font-semibold text-slate-500 pointer-events-none truncate max-w-[50px]">
                  {t(field.unit as any) || tSchema(field.unit)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const curr = typeof value === 'number' ? value : Number(value) || 0;
                  onChange(Math.max(0, curr - 1));
                }}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors shadow-2xs"
                title="-1"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => {
                  const curr = typeof value === 'number' ? value : Number(value) || 0;
                  onChange(curr + 1);
                }}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors shadow-2xs"
                title="+1"
              >
                +
              </button>
            </div>
          </div>
        ) : field.type === 'text' ? (
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={field.placeholder ? tSchema(field.placeholder) : ''}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-xl bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <VoiceInputButton
                value={value || ''}
                onChange={(val) => onChange(val)}
                size="xs"
                mode="append"
                context="question_answer"
                id={`btn-voice-f-${field.id}`}
              />
            </div>
          </div>
        ) : null}

        {field.type === 'textarea' && (
          <div className="relative flex items-center">
            <textarea
              placeholder={field.placeholder ? tSchema(field.placeholder) : ''}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-xl bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors min-h-[80px]"
            />
            <div className="absolute right-1.5 top-3">
              <VoiceInputButton
                value={value || ''}
                onChange={(val) => onChange(val)}
                size="xs"
                mode="append"
                context="question_answer"
                id={`btn-voice-f-${field.id}`}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderedContent = (
    <div className="space-y-4">
      {innerContent()}

      {/* Dependent child fields rendered inside the same card directly under the parent question */}
      {(() => {
        const visibleChildren = directChildren.filter((c) => isConditionMet(c));
        if (visibleChildren.length === 0) return null;

        const allCompact = visibleChildren.every((c) => c.type !== 'dynamic_list' && c.type !== 'textarea');
        const gridContainerClass = (visibleChildren.length > 1 && allCompact)
          ? "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 mt-2"
          : "space-y-3 pt-2 mt-2";

        return (
          <div className={gridContainerClass}>
            {visibleChildren.map((childField) => {
              const isFullWidth = childField.type === 'dynamic_list' || childField.type === 'textarea';
              return (
                <div
                  key={childField.id}
                  id={`dependent-field-${childField.id}`}
                  className={`rounded-xl border border-teal-200/90 bg-teal-50/40 p-3.5 sm:p-4 space-y-2.5 relative shadow-2xs animate-in fade-in-50 slide-in-from-top-1 duration-200 ${
                    isFullWidth ? 'col-span-full' : ''
                  }`}
                >
                  {childField.label && childField.type !== 'dynamic_list' && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 border-b border-teal-100/80 pb-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{tSchema(childField.label)}</span>
                    </div>
                  )}
                  <FieldRenderer
                    field={childField}
                    values={values}
                    allStepFields={allStepFields}
                    onChange={(val) => onUpdateValue ? onUpdateValue(childField.id, val) : onChange(val)}
                    isConditionMet={isConditionMet}
                    isNested={true}
                    onUpdateValue={onUpdateValue}
                    onOpenMedModal={onOpenMedModal}
                    patientName={patientName}
                  />
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );

  if (isNested) {
    return renderedContent;
  }

  return (
    <div
      id={index === 0 ? 'dynamic-complaint-first-question' : `question-card-${field.id}`}
      data-question-index={index}
      className={`p-5 rounded-2xl border transition-all scroll-mt-4 ${
        isAnswered
          ? 'bg-white border-teal-200/90 shadow-2xs'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center font-mono shrink-0">
              {index + 1}
            </span>
            {category && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                {tSchema(category)}
              </span>
            )}
            {isAnswered ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> {dict['complaintQuestionsStatusDone'] || 'Erledigt'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                {dict['complaintQuestionsStatusOpen'] || 'Offen'}
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
            {tSchema(field.label)}
          </h4>
        </div>
      </div>
      {renderedContent}
    </div>
  );
};
