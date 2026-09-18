import React, { useState, useEffect } from 'react';
import { Therapist, PackagePlan } from '../types';
import { getPackagePlans, assignPackageToTherapist, getTherapistUsageCount, getTariffAccessForTherapist } from '../services/storage';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  Sparkles, 
  Check, 
  CheckCircle2, 
  Zap, 
  Infinity as InfinityIcon, 
  Layers, 
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CreditCard,
  Coins,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  X,
  Lock,
  LockKeyhole,
  BarChart3,
  History,
  Wallet
} from 'lucide-react';
import {
  fetchTherapistBalance,
  createCheckoutSession,
  verifyStripeCheckoutSession,
  updateTherapistAutoReload,
  TherapistBalanceResponse
} from '../services/stripeBillingService';
import { TherapistBillingAnalytics } from './TherapistBillingAnalytics';

export type TherapistSettingsTab = 'credit' | 'tariffs' | 'history';

interface TherapistTariffManagerProps {
  therapist: Therapist;
  defaultTab?: TherapistSettingsTab;
  onTariffChanged?: (updated: Therapist) => void;
}

export const TherapistTariffManager: React.FC<TherapistTariffManagerProps> = ({
  therapist,
  defaultTab = 'credit',
  onTariffChanged
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TherapistSettingsTab>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const packagePlans = getPackagePlans().filter(p => p.isActive !== false);

  const [resetUsageOnSwitch, setResetUsageOnSwitch] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stripe Billing & Balance State
  const [billingInfo, setBillingInfo] = useState<TherapistBalanceResponse | null>(null);
  const [loadingBilling, setLoadingBilling] = useState<boolean>(true);
  const [topUpLoading, setTopUpLoading] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(20);
  const [showCustomTopUp, setShowCustomTopUp] = useState<boolean>(false);
  const [autoReloadActive, setAutoReloadActive] = useState<boolean>(false);

  // Payment Modal State
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState<PackagePlan | null>(null);
  const [topUpModalAmount, setTopUpModalAmount] = useState<number | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<'overview' | 'payment_details'>('overview');
  const [cardHolder, setCardHolder] = useState<string>(
    `${therapist.vorname || ''} ${therapist.nachname || ''}`.trim() || 'Dr. Med. Therapeut'
  );
  const [cardNumber, setCardNumber] = useState<string>('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('888');
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);

  // Determine if therapist is on a free plan
  const currentPlanId = therapist.tarifId || therapist.tarif;
  const currentPlan = packagePlans.find(p => p.id === currentPlanId) || packagePlans.find(p => p.id === 'free_trial');
  const isFreeTier = !currentPlan || currentPlan.id === 'free' || currentPlan.id === 'free_trial' || (currentPlan.price === 0 && !currentPlan.isUnlimited) || therapist.tarif === 'free' || therapist.tarif === 'free_trial';

  // If the therapist already has an upgraded/paid tariff, the free tier option completely disappears
  const visiblePackagePlans = packagePlans.filter((plan) => {
    const isPlanFree = plan.id === 'free' || plan.id === 'free_trial' || (plan.price === 0 && !plan.isUnlimited);
    if (!isFreeTier && isPlanFree) {
      return false;
    }
    return true;
  });

  const loadBillingData = async () => {
    setLoadingBilling(true);
    try {
      const data = await fetchTherapistBalance(therapist.id);
      if (data) {
        setBillingInfo(data);
        setAutoReloadActive(!!data.autoReloadEnabled);
      }
    } catch (err) {
      console.error('Failed to load therapist billing info:', err);
    } finally {
      setLoadingBilling(false);
    }
  };

  useEffect(() => {
    loadBillingData();

    const handleBalanceChanged = () => {
      loadBillingData();
    };
    window.addEventListener('homoeo_billing_balance_changed', handleBalanceChanged);

    // Check if returning from Stripe checkout or payment redirect
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const rawSessionIds = urlParams.getAll('session_id');
    const sessionId = rawSessionIds.find(s => s && s !== '{CHECKOUT_SESSION_ID}' && !s.includes('CHECKOUT_SESSION_ID')) || null;
    const stripeStatus = urlParams.get('stripe_status');
    const returnType = urlParams.get('type') || '';
    const returnTargetTariffId = urlParams.get('targetTariffId') || urlParams.get('target_tariff_id') || '';
    const returnAmount = parseFloat(urlParams.get('amount') || '0') || 0;

    if (paymentStatus === 'cancelled' || stripeStatus === 'cancelled') {
      setErrorMessage(t('therapistPaymentCancelledMsg'));
      setTimeout(() => setErrorMessage(null), 6000);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'success' || stripeStatus === 'success' || sessionId) {
      // Verify payment with Stripe backend before crediting or updating
      if (sessionId) {
        verifyStripeCheckoutSession(sessionId, therapist.id, {
          targetTariffId: returnTargetTariffId,
          type: returnType,
          amountEur: returnAmount
        })
          .then((res) => {
            if (res.success) {
              const finalTargetId = res.targetTariffId || returnTargetTariffId;
              const isUpgrade = res.upgraded || res.type === 'package_purchase' || Boolean(finalTargetId);

              if (isUpgrade && finalTargetId) {
                const targetPlan = packagePlans.find(p => p.id === finalTargetId);
                if (targetPlan) {
                  const updated = assignPackageToTherapist(therapist.id, targetPlan.id, resetUsageOnSwitch);
                  if (updated && onTariffChanged) {
                    onTariffChanged(updated);
                  }
                  setSuccessMessage(t('tariffUpgradeSuccessMsg', {
                    planName: targetPlan.name,
                    amount: (res.amountEur || returnAmount || targetPlan.price).toFixed(2)
                  }));
                }
              } else {
                setSuccessMessage(t('paymentTopUpSuccessMsg', {
                  amount: (res.amountEur || returnAmount || 20).toFixed(2)
                }));
              }
              loadBillingData();
            } else {
              setErrorMessage(t('therapistPaymentErrorDesc'));
            }
          })
          .catch(() => {
            setErrorMessage(t('therapistPaymentErrorDesc'));
          })
          .finally(() => {
            setTimeout(() => {
              setSuccessMessage(null);
              setErrorMessage(null);
            }, 6000);
            window.history.replaceState({}, document.title, window.location.pathname);
          });
      } else if (paymentStatus === 'success') {
        // Returned without a valid session ID
        setErrorMessage(t('therapistPaymentErrorDesc'));
        setTimeout(() => setErrorMessage(null), 6000);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    return () => {
      window.removeEventListener('homoeo_billing_balance_changed', handleBalanceChanged);
    };
  }, [therapist.id]);

  const handleTopUp = (amount: number) => {
    if (isFreeTier) {
      setErrorMessage(t('therapistFreeTierNoTopUp'));
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    setTopUpModalAmount(amount);
    setUpgradeTargetPlan(null);
    setModalStep('payment_details');
    setPaymentFormError(null);
  };

  const handleToggleAutoReload = async () => {
    const nextState = !autoReloadActive;
    setAutoReloadActive(nextState);
    const success = await updateTherapistAutoReload(therapist.id, nextState, topUpAmount);
    if (success) {
      await loadBillingData();
    }
  };

  // Calculate Pro-Rata upgrade costs
  const calculateUpgradeCost = (targetPlan: PackagePlan) => {
    const newPrice = targetPlan.price || 0;
    if (isFreeTier || !currentPlan || currentPlan.price <= 0) {
      return {
        oldPrice: 0,
        consumedAmount: 0,
        remainingCredit: 0,
        newPrice,
        toPay: newPrice,
      };
    }

    const oldPrice = currentPlan.price || 0;
    // Calculate ratio of usage in current plan (by analyses or tokens)
    const usedFraction = (therapist.maxAnalyses > 0 && !therapist.isUnlimited)
      ? Math.min(1, Math.max(0, therapist.usedAnalyses / therapist.maxAnalyses))
      : 0;

    const consumedAmount = Math.round(oldPrice * usedFraction * 100) / 100;
    const remainingCredit = Math.max(0, Math.round((oldPrice - consumedAmount) * 100) / 100);
    const toPay = Math.max(0, Math.round((newPrice - remainingCredit) * 100) / 100);

    return {
      oldPrice,
      consumedAmount,
      remainingCredit,
      newPrice,
      toPay,
    };
  };

  const handleSwitchTariffClick = (plan: PackagePlan) => {
    if (plan.id === (therapist.tarifId || therapist.tarif)) {
      return;
    }

    // Downgrade to free tier is strictly forbidden if therapist has already upgraded
    const isPlanFree = plan.id === 'free' || plan.id === 'free_trial' || (plan.price === 0 && !plan.isUnlimited);
    if (!isFreeTier && isPlanFree) {
      setErrorMessage(t('tariffDowngradeToFreeForbidden'));
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    const calculation = calculateUpgradeCost(plan);
    if (calculation.toPay > 0) {
      // Open modal showing pro-rata calculation and payment step
      setUpgradeTargetPlan(plan);
      setTopUpModalAmount(null);
      setModalStep('overview');
      setPaymentFormError(null);
    } else {
      // Free switch
      const updated = assignPackageToTherapist(therapist.id, plan.id, resetUsageOnSwitch);
      if (updated) {
        if (onTariffChanged) onTariffChanged(updated);
        setSuccessMessage(`Erfolgreich auf den Tarif "${plan.name}" gewechselt!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    }
  };

  const handleExecutePayment = async () => {
    setPaymentFormError(null);

    // Form validation (Kredit- / Debitkarte)
    const cleanNum = cardNumber.replace(/\D/g, '');
    if (!cardHolder.trim() || cleanNum.length < 12) {
      setPaymentFormError(t('paymentCardValidationErr'));
      return;
    }

    setUpgradeLoading(true);

    const isUpgrade = Boolean(upgradeTargetPlan);
    const amountToPay = isUpgrade 
      ? calculateUpgradeCost(upgradeTargetPlan!).toPay 
      : (topUpModalAmount || 20);
    const targetTariffId = isUpgrade ? upgradeTargetPlan!.id : undefined;
    const paymentType = isUpgrade ? 'package_purchase' : 'manual_reload';

    try {
      const session = await createCheckoutSession({
        therapistId: therapist.id,
        amountEur: amountToPay,
        type: paymentType,
        targetTariffId,
        therapistEmail: therapist.email,
        therapistName: `${therapist.vorname || ''} ${therapist.nachname || ''}`.trim(),
      });

      if (session?.url && session.mode === 'stripe') {
        window.location.href = session.url;
        return;
      }

      // Online payment is currently unavailable, in maintenance, or test mode without Live Stripe
      const errorMsg = session?.message || t('paymentGatewayNotLiveMsg');
      setPaymentFormError(errorMsg);
    } catch (err: any) {
      console.error('Payment execution failed:', err);
      setPaymentFormError(t('paymentGatewayNotLiveMsg'));
    } finally {
      setUpgradeLoading(false);
    }
  };

  const isUnlimited = therapist.isUnlimited || therapist.tarif === 'pro_unlimited' || therapist.maxAnalyses >= 900000;
  const used = therapist.usedAnalyses;
  const max = therapist.maxAnalyses;
  const remaining = isUnlimited ? Infinity : Math.max(0, max - used);
  const percentUsed = isUnlimited ? 100 : Math.min(100, Math.round((used / max) * 100));

  return (
    <div className="space-y-8 animate-fadeIn" id="therapist-tariff-manager">
      {/* 1. HERO CARD: AKTIV ENTSPRECHENDER TARIF */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              {t('tariffCurrentPlan')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              {therapist.tarifLabel || 'Kostenloser Test-Tarif'}
              {isUnlimited ? (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <InfinityIcon className="w-3.5 h-3.5" /> Flatrate
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {max} Analysen
                </span>
              )}
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              {isUnlimited 
                ? 'Sie nutzen die unbegrenzte Praxis-Lizenz ohne Analyselimit. Alle Repertorisationsfunktionen und Fallaufnahmen stehen unbeschränkt zur Verfügung.'
                : `Aktives Kontingent für homöopathische Fallrepertorisationen. Verbleibend: ${remaining} von ${max} Vollanalysen.`}
            </p>
          </div>

          {/* Meter Box */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 min-w-[240px]">
            <div className="text-xs text-slate-300 font-medium flex items-center justify-between mb-2">
              <span>Nutzungskontingent</span>
              <span className="font-bold text-white">
                {isUnlimited ? 'Unbegrenzt' : `${used} / ${max}`}
              </span>
            </div>

            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isUnlimited 
                    ? 'bg-emerald-400 w-full' 
                    : percentUsed >= 100 
                    ? 'bg-rose-500' 
                    : percentUsed >= 66 
                    ? 'bg-amber-400' 
                    : 'bg-teal-400'
                }`}
                style={{ width: isUnlimited ? '100%' : `${percentUsed}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                {isUnlimited ? 'Keine Beschränkung' : `${remaining} verbleibend`}
              </span>
              <span className="text-teal-300 font-semibold">
                {isUnlimited ? '100% aktiv' : `${percentUsed}% verbraucht`}
              </span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-6 p-3.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center gap-2 text-sm text-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-6 p-3.5 bg-rose-500/20 border border-rose-400/40 rounded-xl flex items-center gap-2 text-sm text-rose-200 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-rose-300 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* DETAILED FEATURE QUOTAS & USAGE BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Funktions-Kontingente & aktuelle Nutzung</h3>
            <p className="text-xs text-slate-500">Detaillierte Übersicht aller verfügbaren Features und Ihres aktuellen Verbrauchs im Tarif.</p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            {therapist.tarifLabel || 'Aktiv'}
          </div>
        </div>

        {(() => {
          const access = getTariffAccessForTherapist(therapist);
          const limits = access.featureLimits;
          const featuresList = [
            { key: 'quick_intake', label: 'Akutaufnahmen (Quick Intake)', limit: limits.unlimitedQuickIntake ? -1 : (limits.maxQuickIntake ?? 3), used: getTherapistUsageCount(therapist.id, 'quick_intake') },
            { key: 'med_research', label: 'Medikamenten-Recherchen', limit: limits.unlimitedMedResearch ? -1 : (limits.maxMedResearch ?? 10), used: getTherapistUsageCount(therapist.id, 'med_research') },
            { key: 'materia_search', label: 'Materia Medica Suchen', limit: limits.unlimitedMateriaMedicaSearch ? -1 : (limits.maxMateriaMedicaSearch ?? 25), used: getTherapistUsageCount(therapist.id, 'materia_search') },
            { key: 'repertorium_search', label: 'Repertorium Suchen', limit: limits.unlimitedRepertoriumSearch ? -1 : (limits.maxRepertoriumSearch ?? 25), used: getTherapistUsageCount(therapist.id, 'repertorium_search') },
            { key: 'risk_analysis', label: 'Risiko-Analysen', limit: limits.unlimitedRiskAnalyses ? -1 : (limits.maxRiskAnalyses ?? 5), used: getTherapistUsageCount(therapist.id, 'risk_analysis') },
            { key: 'reports', label: 'PDF-Berichte & Export', limit: limits.unlimitedReports ? -1 : (limits.maxReports ?? 10), used: getTherapistUsageCount(therapist.id, 'reports') },
            { key: 'ai_request', label: 'KI-Spezialanfragen (AI Requests)', limit: limits.unlimitedAiRequests ? -1 : (limits.maxAiRequests ?? 50), used: getTherapistUsageCount(therapist.id, 'ai_request') },
          ];

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuresList.map(f => {
                const isInf = access.isUnlimitedAll || f.limit < 0;
                const pct = isInf ? 0 : Math.min(100, Math.round((f.used / f.limit) * 100));
                const reached = !isInf && f.used >= f.limit;
                return (
                  <div key={f.key} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">{f.label}</span>
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${reached ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'}`}>
                        {f.used} / {isInf ? '∞' : f.limit}
                      </span>
                    </div>
                    {!isInf && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${reached ? 'bg-rose-500' : 'bg-teal-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{isInf ? 'Unbegrenzte Nutzung' : `${Math.max(0, f.limit - f.used)} verbleibend`}</span>
                      {reached && <span className="text-rose-600 font-bold">Limit erreicht</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* NAVIGATION TABS FOR SETTINGS / BILLING */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            id="settings-subtab-credit"
            onClick={() => setActiveTab('credit')}
            className={`px-4 py-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === 'credit'
                ? 'bg-teal-50 border border-teal-200/80 text-teal-950 shadow-xs'
                : 'hover:bg-slate-50 text-slate-600 border border-transparent'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'credit' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold truncate">
                {t('therapistTabCreditOverview')}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {t('therapistTabCreditOverviewDesc')}
              </div>
            </div>
          </button>

          <button
            type="button"
            id="settings-subtab-tariffs"
            onClick={() => setActiveTab('tariffs')}
            className={`px-4 py-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === 'tariffs'
                ? 'bg-teal-50 border border-teal-200/80 text-teal-950 shadow-xs'
                : 'hover:bg-slate-50 text-slate-600 border border-transparent'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'tariffs' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold truncate">
                {t('therapistTabTariffPlans')}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {t('therapistTabTariffPlansDesc')}
              </div>
            </div>
          </button>

          <button
            type="button"
            id="settings-subtab-history"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === 'history'
                ? 'bg-teal-50 border border-teal-200/80 text-teal-950 shadow-xs'
                : 'hover:bg-slate-50 text-slate-600 border border-transparent'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              activeTab === 'history' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <History className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold truncate">
                {t('therapistTabTransactions')}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {t('therapistTabTransactionsDesc')}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. TAB: CREDIT & USAGE */}
      {activeTab === 'credit' && (
        <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {t('therapistBalanceCardTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Token-Guthaben für KI-Analysen und klinische Repertorisationen via Stripe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadBillingData}
              disabled={loadingBilling}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Aktualisieren"
            >
              <RefreshCw className={`w-4 h-4 ${loadingBilling ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Balance Status Banner if Low */}
        {billingInfo?.isLowBalance && !isFreeTier && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">
                {t('therapistLowBalanceAlert', {
                  balance: (billingInfo.balanceEur || 0).toFixed(2),
                  threshold: (billingInfo.lowBalanceThreshold || 5).toFixed(2)
                })}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Laden Sie Ihr Guthaben rechtzeitig auf, um Fallanalysen ohne Unterbrechung durchführen zu können.
              </p>
            </div>
          </div>
        )}

        {/* Metrics & Top-Up Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Live Restguthaben */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t('therapistCurrentBalance')}
              </span>
              <div className="text-3xl font-black text-slate-900 font-mono">
                {(billingInfo?.balanceEur ?? 0).toFixed(2)} €
              </div>
              <div className="mt-2 flex items-center gap-2">
                {isFreeTier ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" />
                    Kostenlos-Tarif
                  </span>
                ) : billingInfo?.isLowBalance ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Niedriger Stand (&lt; {(billingInfo?.lowBalanceThreshold ?? 5).toFixed(2)} €)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3" />
                    Guthaben ausreichend
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex justify-between items-center">
              <span>{t('therapistTotalDeposited')}:</span>
              <span className="font-mono font-semibold text-slate-700">
                {(billingInfo?.totalDepositedEur ?? 0).toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Card 2: Stripe Top-Up Actions OR Free Tier Upgrade Notice */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 flex flex-col justify-between md:col-span-2">
            {isFreeTier ? (
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>{t('therapistFreeTierCardTitle')}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {t('therapistFreeTierNoTopUp')}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <a
                    href="#tariff-plans-grid"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('therapistFreeTierUpgradeBtn')}</span>
                  </a>
                  <span className="text-xs text-slate-500">
                    Upgrades werden sofort aktiv
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Guthaben über Stripe aufladen
                  </span>
                  <p className="text-xs text-slate-600 mb-4">
                    Sichere Zahlung per Kredit- oder Debitkarte über Stripe Checkout. Ihr Guthaben wird in Echtzeit gutgeschrieben.
                  </p>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    {[10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          topUpAmount === amt && !showCustomTopUp
                            ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
                        }`}
                      >
                        +{amt} €
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setShowCustomTopUp(!showCustomTopUp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        showCustomTopUp
                          ? 'bg-violet-50 text-violet-700 border-violet-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Anderer Betrag
                    </button>
                  </div>

                  {/* Custom Input if toggled */}
                  {showCustomTopUp && (
                    <div className="flex items-center gap-2 max-w-xs mb-3 animate-fadeIn">
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(Math.max(1, Number(e.target.value)))}
                        className="w-28 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-violet-600"
                      />
                      <span className="text-xs text-slate-600 font-semibold">Euro (€)</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80 mt-3">
                  <button
                    type="button"
                    onClick={() => handleTopUp(topUpAmount)}
                    disabled={topUpLoading}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {topUpLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    <span>Jetzt {topUpAmount} € aufladen</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>256-Bit SSL · Stripe Checkout</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Reload Toggle (Only for paid plans) */}
        {!isFreeTier && (
          <div className="mt-6 p-4 rounded-xl bg-violet-50/50 border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-violet-900 block">
                {t('therapistAutoReloadTitle')}
              </span>
              <p className="text-xs text-violet-700">
                {t('therapistAutoReloadDesc')}
              </p>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoReloadActive}
                onChange={handleToggleAutoReload}
                className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                Automatische Nachbuchung aktiv
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 3. VISUALISIERUNG & VERBRAUCHS-STATISTIK (DIAGRAMME) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <TherapistBillingAnalytics therapist={therapist} showOnlySection="charts_only" />
      </div>
        </div>
      )}

      {/* 4. TARIF-WECHSEL BEREICH (TABS: TARIFFS) */}
      {activeTab === 'tariffs' && (
      <div id="tariff-plans-grid" className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              {t('tariffSwitchPlan')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Wählen Sie den passenden Tarif für Ihre Praxisauslastung. Ein Wechsel wird sofort wirksam.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={resetUsageOnSwitch}
              onChange={(e) => setResetUsageOnSwitch(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              {t('tariffResetCounter')}
            </span>
          </label>
        </div>

        {/* Tarife Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePackagePlans.map((plan) => {
            const isCurrent = (therapist.tarifId || therapist.tarif) === plan.id;
            const isHighlighted = plan.badge === 'Beliebt' || plan.badge === 'Flatrate' || plan.isUnlimited;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-2 border-teal-600 bg-teal-50/30 shadow-md ring-4 ring-teal-600/10'
                    : isHighlighted
                    ? 'border-2 border-teal-400 bg-white shadow-sm hover:shadow-md'
                    : 'border border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Popular / Active Badge */}
                <div className="flex items-center justify-between mb-4">
                  {isCurrent ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-600 text-white flex items-center gap-1 shadow-sm">
                      <Check className="w-3.5 h-3.5" /> {t('tariffActiveBadge')}
                    </span>
                  ) : plan.badge ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> {plan.badge}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Tarifoption
                    </span>
                  )}

                  {plan.isUnlimited ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Unbegrenzt
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                      {plan.maxAnalyses} Analysen
                    </span>
                  )}
                </div>

                {/* Plan Info */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="pt-2 pb-3 border-y border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {plan.price === 0 ? '0 €' : `€${plan.price}`}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {plan.billingPeriod === 'monthly' ? '/ Monat' : plan.billingPeriod === 'yearly' ? '/ Jahr' : 'dauerhaft'}
                      </span>
                    </div>
                  </div>

                  {/* Token Balance & Threshold info */}
                  <div className="p-2.5 rounded-lg bg-violet-50/70 border border-violet-100 text-violet-900 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Coins className="w-3.5 h-3.5 text-violet-600" />
                      Start-Guthaben: <strong className="font-mono">{plan.initialBookingAmount ?? 20} €</strong>
                    </span>
                    <span className="text-[11px] text-violet-600 font-medium">
                      Alarm: &lt; {plan.lowBalanceThreshold ?? 5} €
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 py-2 text-xs text-slate-600">
                    {(plan.features || []).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="pt-6 mt-4">
                  {isCurrent ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-teal-100 text-teal-800 text-center font-semibold text-xs flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-teal-700" />
                      Aktuell aktiviert
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchTariffClick(plan)}
                      className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                        isHighlighted
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>{t('tariffChangeBtn')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* 5. TAB: HISTORIE DER ZUBUCHUNGEN (TABS: HISTORY) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <TherapistBillingAnalytics therapist={therapist} showOnlySection="history_only" />
        </div>
      )}

      {/* 4. PROFESSIONAL PAYMENT & UPGRADE MODAL */}
      {(upgradeTargetPlan || topUpModalAmount) && (() => {
        const isUpgrade = Boolean(upgradeTargetPlan);
        const calc = upgradeTargetPlan ? calculateUpgradeCost(upgradeTargetPlan) : null;
        const amountToPay = isUpgrade ? (calc?.toPay ?? 0) : (topUpModalAmount ?? 20);

        const handleCloseModal = () => {
          if (upgradeLoading) return;
          setUpgradeTargetPlan(null);
          setTopUpModalAmount(null);
          setPaymentFormError(null);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                    {isUpgrade ? <Sparkles className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">
                      {isUpgrade ? t('tariffUpgradeModalTitle') : t('paymentMethodModalTitle')}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isUpgrade 
                        ? `${currentPlan?.name || 'Aktueller Tarif'} ➔ ${upgradeTargetPlan?.name}`
                        : `Guthaben-Aufladung (+${amountToPay.toFixed(2)} €)`
                      }
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={upgradeLoading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Navigation Tabs (only for Upgrade) */}
              {isUpgrade && (
                <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => { if (!upgradeLoading) setModalStep('overview'); }}
                    className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      modalStep === 'overview'
                        ? 'border-teal-600 text-teal-700 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>{t('paymentStepTariff')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (!upgradeLoading) setModalStep('payment_details'); }}
                    className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      modalStep === 'payment_details'
                        ? 'border-teal-600 text-teal-700 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LockKeyhole className="w-3.5 h-3.5" />
                    <span>2. {t('paymentStepDetails')}</span>
                  </button>
                </div>
              )}

              {/* Scrollable Body */}
              <div className="p-6 space-y-4 overflow-y-auto">
                {/* STEP 1: Overview & Pro-Rata (Only for Upgrade) */}
                {isUpgrade && modalStep === 'overview' && calc && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {calc.oldPrice > 0 
                        ? t('tariffUpgradeExplanation', { remaining: calc.remainingCredit.toFixed(2), newPrice: calc.newPrice.toFixed(2) })
                        : t('tariffUpgradeFreeExplanation', { newPrice: calc.newPrice.toFixed(2) })}
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>{t('tariffUpgradeNewPrice')}:</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">{calc.newPrice.toFixed(2)} €</span>
                      </div>

                      {calc.oldPrice > 0 && (
                        <>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>{t('tariffUpgradeOldPrice')}:</span>
                            <span className="font-mono text-slate-700">{calc.oldPrice.toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>{t('tariffUpgradeConsumed')}:</span>
                            <span className="font-mono text-slate-700">- {calc.consumedAmount.toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between items-center text-teal-700 font-medium pt-1 border-t border-slate-200">
                            <span>{t('tariffUpgradeRemainingCredit')}:</span>
                            <span className="font-mono font-bold">{calc.remainingCredit.toFixed(2)} €</span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t-2 border-slate-300 text-slate-900 font-bold text-sm">
                        <span className="text-slate-900">{t('tariffUpgradeAmountToPay')}:</span>
                        <span className="text-emerald-700 font-extrabold text-base font-mono">{calc.toPay.toFixed(2)} €</span>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2.5 text-xs text-teal-900">
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{t('tariffUpgradePaymentNotice')}</span>
                    </div>
                  </div>
                )}

                {/* STEP 2: Card Payment Details */}
                {(modalStep === 'payment_details' || !isUpgrade) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <CreditCard className="w-4 h-4 text-teal-600" />
                        <span>{t('paymentMethodCreditCard')}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 font-medium">Visa • Mastercard • Amex</span>
                    </div>

                    {/* Credit Card Form */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          {t('cardHolderLabel')}
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder={t('paymentCardHolderPlaceholder')}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          {t('cardNumberLabel')}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder={t('paymentCardNumberPlaceholder')}
                            maxLength={19}
                            className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                          />
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            {t('cardExpiryLabel')}
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder={t('paymentCardExpiryPlaceholder')}
                            maxLength={5}
                            className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            {t('cardCvcLabel')}
                          </label>
                          <input
                            type="password"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder={t('paymentCardCvcPlaceholder')}
                            maxLength={4}
                            className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Security & Instant Guarantee */}
                    <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1 text-xs text-teal-900">
                      <div className="flex items-center gap-2 font-semibold text-teal-800">
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>{t('paymentSecurityNote')}</span>
                      </div>
                      <p className="text-[11px] text-teal-700 pl-6">
                        {t('paymentInstantActivation')}
                      </p>
                    </div>

                    {/* Validation Error Banner */}
                    {paymentFormError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{paymentFormError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                {isUpgrade && modalStep === 'payment_details' ? (
                  <button
                    type="button"
                    onClick={() => { setModalStep('overview'); setPaymentFormError(null); }}
                    disabled={upgradeLoading}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('paymentBackBtn')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={upgradeLoading}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                )}

                {isUpgrade && modalStep === 'overview' ? (
                  <button
                    type="button"
                    onClick={() => { setModalStep('payment_details'); setPaymentFormError(null); }}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer ml-auto"
                  >
                    <span>{t('paymentNextToPaymentBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={upgradeLoading}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer ml-auto"
                  >
                    {upgradeLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    <span>
                      {isUpgrade 
                        ? t('paymentSubmitUpgradeBtn', { amount: amountToPay.toFixed(2) })
                        : t('paymentSubmitTopUpBtn', { amount: amountToPay.toFixed(2) })
                      }
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

