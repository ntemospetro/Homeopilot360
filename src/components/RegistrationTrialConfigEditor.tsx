import React, { useState, useEffect } from 'react';
import { 
  getRegistrationTrialTranslations, 
  saveRegistrationTrialTranslations 
} from '../services/storage';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../i18n/translations';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  Save, 
  Plus, 
  Trash2,
  Globe,
  Tag,
  AlignLeft,
  ListChecks,
  Euro
} from 'lucide-react';

interface RegistrationTrialConfigEditorProps {
  onSaved: () => void;
}

export const RegistrationTrialConfigEditor: React.FC<RegistrationTrialConfigEditorProps> = ({ onSaved }) => {
  const { t } = useTranslation();
  const [translations, setTranslations] = useState(getRegistrationTrialTranslations());
  const [currentLang, setCurrentLang] = useState<LanguageCode>('de');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTranslations(getRegistrationTrialTranslations());
  }, []);

  const handleTextChange = (field: 'badge' | 'priceDisplay' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [currentLang]: {
        ...prev[currentLang],
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setTranslations(prev => {
      const updatedFeatures = [...(prev[currentLang].features || [])];
      updatedFeatures[index] = value;
      return {
        ...prev,
        [currentLang]: {
          ...prev[currentLang],
          features: updatedFeatures
        }
      };
    });
  };

  const addFeature = () => {
    setTranslations(prev => ({
      ...prev,
      [currentLang]: {
        ...prev[currentLang],
        features: [...(prev[currentLang].features || []), '']
      }
    }));
  };

  const removeFeature = (index: number) => {
    setTranslations(prev => {
      const updatedFeatures = [...(prev[currentLang].features || [])];
      updatedFeatures.splice(index, 1);
      return {
        ...prev,
        [currentLang]: {
          ...prev[currentLang],
          features: updatedFeatures
        }
      };
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveRegistrationTrialTranslations(translations);
      setIsSaving(false);
      onSaved();
    }, 300);
  };

  const currentConfig = translations[currentLang];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-teal-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600" />
            <span>Kostenloser Test-Tarif (Übersetzungen)</span>
          </h3>
          <p className="text-xs text-teal-700/80 mt-1">
            Passen Sie die Texte an, die potenziellen Kunden auf der Registrierungsseite angezeigt werden.
          </p>
        </div>
        
        {/* Language Switcher */}
        <div className="flex flex-wrap gap-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setCurrentLang(lang.code)}
              title={lang.nativeName}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentLang === lang.code
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="uppercase">{lang.code}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Badge / Titel */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Badge / Titel ({currentLang.toUpperCase()})</span>
            </label>
            <input
              type="text"
              value={currentConfig.badge}
              onChange={(e) => handleTextChange('badge', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="z.B. Kostenloser Test-Tarif"
            />
          </div>

          {/* Preis Darstellung */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5 text-slate-400" />
              <span>Preis Darstellung ({currentLang.toUpperCase()})</span>
            </label>
            <input
              type="text"
              value={currentConfig.priceDisplay}
              onChange={(e) => handleTextChange('priceDisplay', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="z.B. 0,00 €"
            />
          </div>
        </div>

        {/* Beschreibungstext */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Beschreibungstext ({currentLang.toUpperCase()})</span>
          </label>
          <textarea
            value={currentConfig.description}
            onChange={(e) => handleTextChange('description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
            placeholder="Beschreiben Sie den Test-Tarif..."
          />
        </div>

        {/* Feature-Liste */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-slate-400" />
              <span>Feature-Liste ({currentLang.toUpperCase()})</span>
            </label>
            <button
              onClick={addFeature}
              className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addFeature') || 'Feature hinzufügen'}</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {(currentConfig.features || []).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(idx, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder={`Feature ${idx + 1}`}
                />
                <button
                  onClick={() => removeFeature(idx)}
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title={t('btnDelete') || 'Feature entfernen'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!currentConfig.features || currentConfig.features.length === 0) && (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg text-center border border-dashed border-slate-200">
                Keine Features hinterlegt.
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (t('saving') || 'Speichern...') : (t('saveChanges') || 'Speichern')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
