import React, { useState } from 'react';
import { Therapist, PackagePlan } from '../types';
import { getPackagePlans, assignPackageToTherapist } from '../services/storage';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  Package, 
  Sparkles, 
  Check, 
  X, 
  Infinity as InfinityIcon, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface TariffAssignModalProps {
  therapist: Therapist;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: (updatedTherapist: Therapist) => void;
}

export const TariffAssignModal: React.FC<TariffAssignModalProps> = ({
  therapist,
  isOpen,
  onClose,
  onAssigned,
}) => {
  const { t } = useTranslation();
  const plans = getPackagePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    therapist.tarifId || therapist.tarif || plans[0]?.id || 'free_trial'
  );
  const [resetUsage, setResetUsage] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleAssign = () => {
    const updated = assignPackageToTherapist(therapist.id, selectedPlanId, resetUsage);
    if (updated) {
      onAssigned(updated);
      onClose();
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Tarif & Paket für Therapeut zuweisen
              </h3>
              <p className="text-xs text-slate-400">
                {therapist.vorname} {therapist.nachname} ({therapist.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status bar */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Aktueller Tarif:</span>{' '}
            <strong className="text-slate-900 font-bold">{therapist.tarifLabel || therapist.tarif}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Verbrauch:</span>{' '}
            <span className="font-mono font-bold text-slate-800">
              {therapist.usedAnalyses} / {therapist.isUnlimited || therapist.tarif === 'pro_unlimited' ? '∞' : therapist.maxAnalyses} Analysen
            </span>
          </div>
        </div>

        {/* Available Packages List */}
        <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Verfügbare Tarife & Pakete auswählen
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isFlatrate = plan.isUnlimited || plan.maxAnalyses >= 900000;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{plan.name}</span>
                        {plan.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{plan.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-slate-900 font-mono">
                      {plan.price === 0 ? '0 €' : `${plan.price} ${plan.currency || '€'}`}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center justify-end gap-1">
                      {isFlatrate ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <InfinityIcon className="w-3 h-3" /> Unbegrenzt
                        </span>
                      ) : (
                        <span>{plan.maxAnalyses} Analysen</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset usage checkbox */}
          <div className="pt-3 border-t border-slate-200">
            <label className="flex items-center gap-2 p-2.5 rounded-md bg-slate-50 border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={resetUsage}
                onChange={(e) => setResetUsage(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                  Verbrauchte Analysen auf 0 zurücksetzen
                </span>
                <p className="text-[10px] text-slate-500">
                  Empfohlen beim Wechsel auf ein neues Kontingent oder ein Upgrade.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-slate-600 text-xs">
            Neuer Status:{' '}
            <strong className="text-teal-800 font-semibold">
              {selectedPlan?.isUnlimited ? 'Pro Unbegrenzt (Aktiv)' : 'Aktiv mit Kontingent'}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-md transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleAssign}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('assignTariff') || 'Tarif zuweisen'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
