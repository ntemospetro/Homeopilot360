import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Ruler, 
  Activity, 
  HeartHandshake, 
  Mail, 
  Phone, 
  Baby, 
  Users, 
  Layers, 
  Plus, 
  Trash2, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react';
import { PatientCase, PatientChild } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { VoiceInputButton } from './VoiceInputButton';

interface StammdatenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PatientCase;
  onSave: (data: Partial<PatientCase>) => void;
}

export const StammdatenModal: React.FC<StammdatenModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Partial<PatientCase>>({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowValidationAlert(false);
      setFormData({
        patientName: initialData.patientName || '',
        patientBirthDate: initialData.patientBirthDate || '',
        patientAge: initialData.patientAge,
        patientGender: initialData.patientGender || 'weiblich',
        patientHeightCm: initialData.patientHeightCm,
        patientWeightKg: initialData.patientWeightKg,
        patientMaritalStatus: initialData.patientMaritalStatus || '',
        anamneseDatum: initialData.anamneseDatum || new Date().toISOString().split('T')[0],
        patientEmail: initialData.patientEmail || '',
        patientPhone: initialData.patientPhone || '',
        isPregnant: initialData.isPregnant || false,
        pregnancyMonth: initialData.pregnancyMonth,
        hasChildren: initialData.hasChildren || false,
        childrenCount: initialData.childrenCount || 0,
        childrenList: initialData.childrenList ? JSON.parse(JSON.stringify(initialData.childrenList)) : [],
        customStammdaten: initialData.customStammdaten ? JSON.parse(JSON.stringify(initialData.customStammdaten)) : [],
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddChild = () => {
    const newChild: PatientChild = {
      id: `child_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      age: undefined,
      gender: 'weiblich',
    };
    const updatedList = [...(formData.childrenList || []), newChild];
    setFormData(prev => ({
      ...prev,
      hasChildren: true,
      childrenCount: updatedList.length,
      childrenList: updatedList,
    }));
  };

  const handleUpdateChild = (id: string, field: keyof PatientChild, value: any) => {
    const updatedList = (formData.childrenList || []).map(ch => {
      if (ch.id === id) {
        return { ...ch, [field]: value };
      }
      return ch;
    });
    setFormData(prev => ({
      ...prev,
      childrenList: updatedList,
      childrenCount: updatedList.length,
    }));
  };

  const handleRemoveChild = (id: string) => {
    const updatedList = (formData.childrenList || []).filter(ch => ch.id !== id);
    setFormData(prev => ({
      ...prev,
      childrenCount: updatedList.length,
      childrenList: updatedList,
      hasChildren: updatedList.length > 0,
    }));
  };

  const handleToggleChildren = (has: boolean) => {
    if (has) {
      if (!formData.childrenList || formData.childrenList.length === 0) {
        const initialChild: PatientChild = {
          id: `child_${Date.now()}_1`,
          name: '',
          age: undefined,
          gender: 'weiblich',
        };
        setFormData(prev => ({
          ...prev,
          hasChildren: true,
          childrenCount: 1,
          childrenList: [initialChild],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          hasChildren: true,
          childrenCount: prev.childrenList?.length || 1,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        hasChildren: false,
        childrenCount: 0,
      }));
    }
  };

  const handleAddCustomField = () => {
    const newField = {
      id: `sd_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      value: '',
    };
    setFormData(prev => ({
      ...prev,
      customStammdaten: [...(prev.customStammdaten || []), newField],
    }));
  };

  const handleUpdateCustomField = (id: string, field: 'name' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      customStammdaten: (prev.customStammdaten || []).map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveCustomField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customStammdaten: (prev.customStammdaten || []).filter(item => item.id !== id),
    }));
  };

  const handleSave = () => {
    if (!formData.patientName || !formData.patientName.trim()) {
      setShowValidationAlert(true);
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/70 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {t('editMasterDataTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('patientDataDesc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Patient Name */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="modal-patient-name">
                {t('patientName')} *
              </label>
              <div className="relative flex items-center">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="modal-patient-name"
                  type="text"
                  placeholder={t('patientNamePlaceholder')}
                  value={formData.patientName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full pl-8 pr-9 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <VoiceInputButton
                    value={formData.patientName || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, patientName: val }))}
                    size="xs"
                    mode="append"
                    id="modal-voice-patient-name"
                  />
                </div>
              </div>
            </div>

            {/* Geburtsdatum */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="modal-patient-birthdate">
                {t('patientBirthDate')}
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="modal-patient-birthdate"
                  type="date"
                  value={formData.patientBirthDate || ''}
                  onChange={(e) => {
                    const bDate = e.target.value;
                    let calcAge = formData.patientAge;
                    if (bDate) {
                      const diff = Date.now() - new Date(bDate).getTime();
                      const ageDate = new Date(diff);
                      calcAge = Math.abs(ageDate.getUTCFullYear() - 1970);
                    }
                    setFormData(prev => ({ 
                      ...prev, 
                      patientBirthDate: bDate,
                      ...(calcAge !== undefined && !isNaN(calcAge) && calcAge >= 0 && calcAge <= 125 ? { patientAge: calcAge } : {})
                    }));
                  }}
                  className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                />
              </div>
            </div>

            {/* Alter */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="modal-patient-age">
                {t('patientAge')}
              </label>
              <input
                id="modal-patient-age"
                type="number"
                min="0"
                max="125"
                placeholder={t('patientAgePlaceholder')}
                value={formData.patientAge !== undefined ? formData.patientAge : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
              />
            </div>

            {/* Geschlecht */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="modal-patient-gender">
                {t('patientGender')}
              </label>
              <select
                id="modal-patient-gender"
                value={formData.patientGender || 'weiblich'}
                onChange={(e) => {
                  const newGender = e.target.value as any;
                  setFormData(prev => ({ 
                    ...prev, 
                    patientGender: newGender,
                    ...(newGender !== 'weiblich' ? { isPregnant: false, pregnancyMonth: undefined } : {})
                  }));
                }}
                className="w-full px-2 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white h-[38px]"
              >
                <option value="weiblich">{t('genderFemale')}</option>
                <option value="männlich">{t('genderMale')}</option>
                <option value="divers">{t('genderOther')}</option>
              </select>
            </div>

            {/* Größe */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="modal-patient-height">
                {t('patientHeight')}
              </label>
              <div className="relative">
                <Ruler className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="modal-patient-height"
                  type="number"
                  min="30"
                  max="260"
                  placeholder={t('patientHeightPlaceholder')}
                  value={formData.patientHeightCm !== undefined ? formData.patientHeightCm : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientHeightCm: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                />
              </div>
            </div>

            {/* Gewicht */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="modal-patient-weight">
                {t('patientWeight')}
              </label>
              <div className="relative">
                <Activity className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="modal-patient-weight"
                  type="number"
                  min="1"
                  max="300"
                  placeholder={t('patientWeightPlaceholder')}
                  value={formData.patientWeightKg !== undefined ? formData.patientWeightKg : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientWeightKg: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                />
              </div>
            </div>

            {/* Familienstand */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="modal-patient-marital">
                {t('patientMaritalStatus')} <span className="text-slate-400 font-normal text-[11px] lowercase">{t('optionalField')}</span>
              </label>
              <div className="relative">
                <HeartHandshake className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <select
                  id="modal-patient-marital"
                  value={formData.patientMaritalStatus || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientMaritalStatus: e.target.value as any }))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white h-[38px]"
                >
                  <option value="">-- {t('selectMaritalStatus')} --</option>
                  <option value="ledig">{t('maritalSingle')}</option>
                  <option value="verheiratet">{t('maritalMarried')}</option>
                  <option value="in Partnerschaft">{t('maritalPartnership')}</option>
                  <option value="geschieden">{t('maritalDivorced')}</option>
                  <option value="getrennt lebend">{t('maritalSeparated')}</option>
                  <option value="verwitwet">{t('maritalWidowed')}</option>
                  <option value="sonstiges">{t('maritalOther')}</option>
                </select>
              </div>
            </div>

            {/* Beratungsdatum */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="modal-anamnese-date">
                {t('anamneseDate')}
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="modal-anamnese-date"
                  type="date"
                  value={formData.anamneseDatum || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, anamneseDatum: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                />
              </div>
            </div>
          </div>

          {/* Kontaktdaten */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-600 shrink-0" />
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {t('contactDataTitle')} <span className="text-slate-500 font-normal text-[11px] lowercase">{t('optionalField')}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1" htmlFor="modal-patient-email">
                  {t('patientEmail')}
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="modal-patient-email"
                    type="email"
                    placeholder={t('patientEmailPlaceholder')}
                    value={formData.patientEmail || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                    className="w-full pl-8 pr-9 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white h-[38px]"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceInputButton
                      value={formData.patientEmail || ''}
                      onChange={(val) => setFormData(prev => ({ ...prev, patientEmail: val }))}
                      size="xs"
                      mode="append"
                      id="modal-voice-patient-email"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1" htmlFor="modal-patient-phone">
                  {t('patientPhone')}
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="modal-patient-phone"
                    type="tel"
                    placeholder={t('patientPhonePlaceholder')}
                    value={formData.patientPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                    className="w-full pl-8 pr-9 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white h-[38px]"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceInputButton
                      value={formData.patientPhone || ''}
                      onChange={(val) => setFormData(prev => ({ ...prev, patientPhone: val }))}
                      size="xs"
                      mode="append"
                      id="modal-voice-patient-phone"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schwangerschaft (falls weiblich) */}
          {formData.patientGender === 'weiblich' && (
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 space-y-3">
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-rose-600 shrink-0" />
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {t('isPregnantLabel')}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isPregnant: false, pregnancyMonth: undefined }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      !formData.isPregnant
                        ? 'bg-white border-slate-300 text-slate-800 shadow-xs font-bold ring-1 ring-slate-300'
                        : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-white'
                    }`}
                  >
                    {t('isPregnantNo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isPregnant: true, pregnancyMonth: prev.pregnancyMonth || 1 }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      formData.isPregnant
                        ? 'bg-rose-600 border-rose-600 text-white shadow-xs font-bold'
                        : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-white'
                    }`}
                  >
                    {t('isPregnantYes')}
                  </button>
                </div>

                {formData.isPregnant && (
                  <div className="sm:col-span-6 flex items-center gap-2 animate-in fade-in duration-150">
                    <label className="text-xs font-semibold text-slate-700 shrink-0" htmlFor="modal-pregnancy-month">
                      {t('pregnancyMonthLabel')}:
                    </label>
                    <select
                      id="modal-pregnancy-month"
                      value={formData.pregnancyMonth || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, pregnancyMonth: parseInt(e.target.value, 10) }))}
                      className="w-full px-3 py-1.5 border border-rose-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-rose-500 bg-white h-[38px]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                        <option key={m} value={m}>
                          {t('pregnancyMonthOption', { month: m })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kinder */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600 shrink-0" />
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {t('hasChildrenLabel')}
                </label>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-200/80 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleToggleChildren(false)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    !formData.hasChildren
                      ? 'bg-white text-slate-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('hasChildrenNo')}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleChildren(true)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    formData.hasChildren
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('hasChildrenYes')}
                </button>
              </div>
            </div>

            {formData.hasChildren && (
              <div className="pt-2 space-y-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">
                    {t('childrenListTitle')} ({formData.childrenList?.length || 0}):
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t('childrenCountLabel')}: {formData.childrenList?.length || 0}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(formData.childrenList || []).map((child, index) => (
                    <div
                      key={child.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                            {index + 1}
                          </span>
                          <span>{t('childEntryLabel', { index: index + 1 })}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChild(child.id)}
                          className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">{t('removeChildBtn')}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            {t('childNameLabel')}
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              placeholder={t('childNamePlaceholder')}
                              value={child.name || ''}
                              onChange={(e) => handleUpdateChild(child.id, 'name', e.target.value)}
                              className="w-full px-2.5 pr-8 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600 h-[34px]"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2">
                              <VoiceInputButton
                                value={child.name || ''}
                                onChange={(val) => handleUpdateChild(child.id, 'name', val)}
                                size="xs"
                                mode="append"
                                id={`modal-voice-child-${child.id}`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            {t('childAgeLabel')}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="120"
                            placeholder="z.B. 7"
                            value={child.age !== undefined ? child.age : ''}
                            onChange={(e) => handleUpdateChild(child.id, 'age', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600 h-[34px]"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            {t('childGenderLabel')}
                          </label>
                          <select
                            value={child.gender || 'weiblich'}
                            onChange={(e) => handleUpdateChild(child.id, 'gender', e.target.value as any)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600 bg-white h-[34px]"
                          >
                            <option value="weiblich">{t('genderFemale')}</option>
                            <option value="männlich">{t('genderMale')}</option>
                            <option value="divers">{t('genderOther')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddChild}
                  className="w-full py-2 px-3 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-100/50 text-teal-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addChildBtn')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Zusätzliche Stammdaten / Freie Felder */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    {t('customStammdatenTitle')}
                  </label>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {t('customStammdatenDesc')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addCustomStammdatenBtn')}</span>
              </button>
            </div>

            {formData.customStammdaten && formData.customStammdaten.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                {formData.customStammdaten.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{field.name || `${t('extraFields')} #${idx + 1}`}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(field.id)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{t('removeChildBtn')}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          {t('profilePraxisNameTitle')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('customStammdatenNamePlaceholder')}
                          value={field.name}
                          onChange={(e) => handleUpdateCustomField(field.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 h-[34px] bg-slate-50/50"
                        />
                      </div>

                      <div className="sm:col-span-8">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          {t('optionalInfo')}
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder={t('customStammdatenValuePlaceholder')}
                            value={field.value}
                            onChange={(e) => handleUpdateCustomField(field.id, 'value', e.target.value)}
                            className="w-full px-2.5 pr-8 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600 h-[34px]"
                          />
                          <div className="absolute right-1 top-1/2 -translate-y-1/2">
                            <VoiceInputButton
                              value={field.value}
                              onChange={(val) => handleUpdateCustomField(field.id, 'value', val)}
                              size="xs"
                              mode="append"
                              id={`modal-voice-custom-sd-${field.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="w-full py-2 px-3 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-100/50 text-teal-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addCustomStammdatenBtn')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-white cursor-pointer transition-colors"
          >
            {t('cancelBtn')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold cursor-pointer shadow-xs transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{t('saveMasterDataBtn')}</span>
          </button>
        </div>
      </div>

      {/* Validation Alert Modal - Missing required patient name */}
      {showValidationAlert && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-900 font-serif">
                {t('missingPatientNameTitle')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('missingPatientNameDesc')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowValidationAlert(false);
                  onClose();
                }}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {t('btnCancelWithoutSaving')}
              </button>
              <button
                type="button"
                onClick={() => setShowValidationAlert(false)}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {t('btnCompleteEntry')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
