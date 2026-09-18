import React from 'react';
import { Lock, Sparkles, CheckCircle2, Shield, X, Package, Infinity as InfinityIcon, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getPackagePlans } from '../services/storage';
import { Therapist } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToAdmin: () => void;
  lockReason?: 'analyses_reached' | 'tokens_reached' | 'none';
  therapist?: Therapist | null;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onGoToAdmin,
  lockReason,
  therapist,
}) => {
  const { t } = useTranslation();
  const currentTariffId = therapist?.tarifId || therapist?.tarif;
  const isFreeTier = !currentTariffId || currentTariffId === 'free' || currentTariffId === 'free_trial';
  const plans = getPackagePlans()
    .filter(p => p.isActive !== false)
    .filter(p => isFreeTier || !(p.id === 'free' || p.id === 'free_trial' || (p.price === 0 && !p.isUnlimited)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('upgradeModalTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('upgradeModalSubtitle')}
          </p>
        </div>

        <div className="p-6 space-y-4 text-slate-600">
          {lockReason === 'tokens_reached' ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {t('quotaLockedReasonTokens', { max: therapist?.maxTokens || 25000 })}
              </div>
            </div>
          ) : lockReason === 'analyses_reached' ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {t('quotaLockedReasonAnalyses', { max: therapist?.maxAnalyses || 3 })}
              </div>
            </div>
          ) : (
            <p className="text-slate-700 leading-relaxed">
              {t('upgradeModalInfo')}
            </p>
          )}

          {/* Dynamic Available Packages Overview */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
              <Package className="w-4 h-4 text-teal-600" />
              <span>Verfügbare Praxis-Tarife & Pakete</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {plans.map((plan) => {
                const isFlatrate = plan.isUnlimited || plan.maxAnalyses >= 900000;
                return (
                  <div
                    key={plan.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs">{plan.name}</span>
                        {plan.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-extrabold font-mono text-slate-900">
                        {plan.price === 0 ? '0 €' : `${plan.price} ${plan.currency || '€'}`}
                        <span className="text-[10px] font-normal text-slate-500 ml-1">
                          {plan.billingPeriod === 'monthly' ? '/ Monat' : plan.billingPeriod === 'yearly' ? '/ Jahr' : plan.billingPeriod === 'one_time' ? 'einmalig' : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isFlatrate ? 'Unbegrenzte Analysen (Flatrate)' : `${plan.maxAnalyses} Vollanalysen inklusive`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {t('upgradeAdminHint')}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            {t('btnClose')}
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToAdmin();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('btnUnlockInAdmin')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
