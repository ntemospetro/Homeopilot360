import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  History,
  TrendingUp,
  Receipt,
  FlaskConical,
  Sparkles,
  Info
} from 'lucide-react';
import {
  fetchAdminStripeConfig,
  saveAdminStripeConfig,
  testStripeConnection,
  fetchBillingPayments,
  simulateAdminTransaction,
  AdminStripeConfigResponse
} from '../services/stripeBillingService';
import { BillingDepositRecord } from '../types';
import { getTherapists, getPackagePlans, assignPackageToTherapist } from '../services/storage';

export const AdminStripeSettings: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [config, setConfig] = useState<AdminStripeConfigResponse | null>(null);
  const [mode, setMode] = useState<'test' | 'live'>('test');
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const [payments, setPayments] = useState<BillingDepositRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Admin Simulation Console state
  const [therapistsList, setTherapistsList] = useState(() => getTherapists());
  const [plansList, setPlansList] = useState(() => getPackagePlans());
  const [simTherapistId, setSimTherapistId] = useState<string>(() => {
    const list = getTherapists();
    return list[0]?.id || 'th-101';
  });
  const [simActionType, setSimActionType] = useState<'manual_reload' | 'package_purchase'>('manual_reload');
  const [simAmount, setSimAmount] = useState<number>(20);
  const [simTargetPlanId, setSimTargetPlanId] = useState<string>(() => {
    const plans = getPackagePlans();
    return plans.find(p => p.id !== 'free')?.id || plans[0]?.id || 'standard';
  });
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const cfg = await fetchAdminStripeConfig();
      if (cfg) {
        setConfig(cfg);
        setMode(cfg.mode || 'test');
        setPublishableKey(cfg.publishableKey || '');
        setSecretKey(cfg.secretKeyMasked || '');
        setWebhookSecret(cfg.webhookSecretMasked || '');
      }

      setLoadingPayments(true);
      const payList = await fetchBillingPayments();
      setPayments(payList);
      setLoadingPayments(false);
    } catch (err) {
      console.error('Error loading stripe data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setTestResult(null);

    const updated = await saveAdminStripeConfig({
      mode,
      publishableKey,
      secretKey: secretKey.includes('••••') ? undefined : secretKey,
      webhookSecret: webhookSecret.includes('••••') ? undefined : webhookSecret,
    });

    setSaving(false);
    if (updated) {
      setConfig(updated);
      setSecretKey(updated.secretKeyMasked || '');
      setWebhookSecret(updated.webhookSecretMasked || '');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testStripeConnection();
    setTesting(false);
    setTestResult(res);
  };

  const copyWebhookUrl = () => {
    if (!config?.webhookUrl) return;
    navigator.clipboard.writeText(config.webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTherapistId) return;
    setSimLoading(true);
    setSimResult(null);

    const isUpgrade = simActionType === 'package_purchase';
    const chosenPlan = plansList.find(p => p.id === simTargetPlanId);
    const amount = isUpgrade ? (chosenPlan?.price || 0) : Math.max(1, simAmount);

    try {
      const res = await simulateAdminTransaction({
        therapistId: simTherapistId,
        type: simActionType,
        amountEur: amount,
        targetTariffId: isUpgrade ? simTargetPlanId : undefined,
        note: isUpgrade 
          ? `Admin-Simulation: Tarif "${chosenPlan?.name || simTargetPlanId}" (${amount.toFixed(2)} €)`
          : `Admin-Simulation: Guthaben-Test (+${amount.toFixed(2)} €)`
      });

      if (res.success) {
        if (isUpgrade && chosenPlan) {
          assignPackageToTherapist(simTherapistId, chosenPlan.id);
        }
        setSimResult({
          success: true,
          message: res.message || t('adminStripeSimSuccess')
        });
        const payList = await fetchBillingPayments();
        setPayments(payList);
      } else {
        setSimResult({
          success: false,
          error: res.error || 'Simulation fehlgeschlagen'
        });
      }
    } catch (err: any) {
      setSimResult({
        success: false,
        error: err.message || 'Simulation fehlgeschlagen'
      });
    } finally {
      setSimLoading(false);
    }
  };

  const totalCollectedEur = payments.reduce((sum, p) => sum + (p.amountEur || 0), 0);

  return (
    <div className="space-y-8" id="admin-stripe-settings-root">
      {/* Header & Status Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('adminStripeSettingsTitle')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{t('adminStripeSettingsDesc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {config?.isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t('adminStripeStatusConfigured')} ({config.mode === 'live' ? 'Live' : 'Test'})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Zap className="w-4 h-4 text-amber-500" />
              {t('adminStripeStatusNotConfigured')}
            </span>
          )}

          <button
            id="btn-refresh-stripe-config"
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Aktualisieren"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Form & Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-gray-100 p-6">
          <form onSubmit={handleSave} className="space-y-5" id="form-stripe-config">
            {/* Mode selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                {t('adminStripeMode')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="btn-stripe-mode-test"
                  type="button"
                  onClick={() => setMode('test')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    mode === 'test'
                      ? 'bg-violet-50 border-violet-300 text-violet-800 ring-2 ring-violet-500/20 shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  {t('adminStripeModeTest')}
                </button>
                <button
                  id="btn-stripe-mode-live"
                  type="button"
                  onClick={() => setMode('live')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    mode === 'live'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {t('adminStripeModeLive')}
                </button>
              </div>
            </div>

            {/* Publishable Key */}
            <div>
              <label htmlFor="stripe-publishable-key" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {t('adminStripePublishableKey')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="stripe-publishable-key"
                  type="text"
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                  placeholder="pk_test_... oder pk_live_..."
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <label htmlFor="stripe-secret-key" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {t('adminStripeSecretKey')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  id="stripe-secret-key"
                  type={showSecretKey ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_test_... oder sk_live_..."
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Webhook Secret */}
            <div>
              <label htmlFor="stripe-webhook-secret" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {t('adminStripeWebhookSecret')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Receipt className="w-4 h-4" />
                </div>
                <input
                  id="stripe-webhook-secret"
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action buttons & feedback */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  id="btn-stripe-save"
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {t('adminStripeSave')}
                </button>

                <button
                  id="btn-stripe-test"
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {testing ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-violet-600" />
                  )}
                  {t('adminStripeTestBtn')}
                </button>
              </div>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md">
                  <Check className="w-4 h-4" />
                  {t('adminStripeSaved')}
                </span>
              )}
            </div>

            {/* Test result display */}
            {testResult && (
              <div
                className={`p-4 rounded-lg text-sm border flex items-start gap-3 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">
                    {testResult.success ? t('adminStripeConnected') : 'Stripe-Test fehlgeschlagen'}
                  </p>
                  <p className="text-xs mt-0.5 opacity-90">{testResult.message || testResult.error}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right 1 Col: Webhook setup instructions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-violet-600" />
              {t('adminStripeWebhookUrl')}
            </h3>
            <p className="text-xs text-gray-500 mb-3">{t('adminStripeWebhookHelp')}</p>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-2 mb-4">
              <code className="text-xs font-mono text-gray-800 break-all select-all">
                {config?.webhookUrl || '/api/billing/webhook'}
              </code>
              <button
                id="btn-copy-webhook-url"
                type="button"
                onClick={copyWebhookUrl}
                className="p-1.5 hover:bg-gray-200 text-gray-600 rounded-md transition-colors shrink-0"
                title="URL kopieren"
              >
                {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 text-xs text-violet-800 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                Echtzeit-Verbuchung:
              </p>
              <p>
                Sobald ein Therapeut über Stripe Checkout ein Token-Paket kauft oder auflädt, sendet Stripe das Event{' '}
                <span className="font-mono font-bold">checkout.session.completed</span>. Das Guthaben wird in Millisekunden
                verbucht.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Finanz-Statistik
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">Gesamte Einzahlungen</span>
                <span className="font-bold text-gray-900 font-mono text-base">
                  {totalCollectedEur.toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-gray-500">Erfolgreiche Transaktionen</span>
                <span className="font-semibold text-gray-900">{payments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Test-Konsole / Transaktions-Simulator (Exklusiv für Administratoren) */}
      <div className="bg-white rounded-xl shadow-xs border border-amber-200 overflow-hidden" id="admin-stripe-simulator-card">
        <div className="p-6 bg-gradient-to-r from-amber-50/60 to-orange-50/30 border-b border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300/40">
              <FlaskConical className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>{t('adminStripeSimulationTitle')}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Admin-Only
                </span>
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {t('adminStripeSimulationDesc')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleRunSimulation} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Ziel-Therapeut auswählen */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t('adminStripeSimSelectTherapist')}
              </label>
              <select
                id="select-sim-therapist"
                value={simTherapistId}
                onChange={(e) => setSimTherapistId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {therapistsList.map((th) => (
                  <option key={th.id} value={th.id}>
                    {th.vorname} {th.nachname} ({th.email || th.id})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Aktionstyp auswählen */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t('adminStripeSimActionType')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-sim-type-reload"
                  onClick={() => setSimActionType('manual_reload')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                    simActionType === 'manual_reload'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t('adminStripeSimTopUp')}
                </button>
                <button
                  type="button"
                  id="btn-sim-type-upgrade"
                  onClick={() => setSimActionType('package_purchase')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                    simActionType === 'package_purchase'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t('adminStripeSimUpgrade')}
                </button>
              </div>
            </div>

            {/* 3. Betrag oder Zieltarif */}
            <div>
              {simActionType === 'manual_reload' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    {t('adminStripeSimAmount')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="input-sim-amount"
                      type="number"
                      min="1"
                      step="5"
                      value={simAmount}
                      onChange={(e) => setSimAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <span className="text-sm font-bold text-gray-600">€</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    {t('adminStripeSimTargetPlan')}
                  </label>
                  <select
                    id="select-sim-plan"
                    value={simTargetPlanId}
                    onChange={(e) => setSimTargetPlanId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {plansList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.price > 0 ? `${p.price.toFixed(2)} €/Monat` : 'Kostenlos'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50/70 border border-amber-200/60 px-3.5 py-2 rounded-lg max-w-xl">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('adminStripeSimNotice')}</span>
            </div>

            <button
              id="btn-run-simulation"
              type="submit"
              disabled={simLoading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {simLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{t('adminStripeSimulateBtn')}</span>
            </button>
          </div>

          {/* Result Box */}
          {simResult && (
            <div
              className={`p-4 rounded-xl text-sm border flex items-start gap-3 animate-fadeIn ${
                simResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {simResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {simResult.success ? t('adminStripeSimSuccess') : 'Simulation fehlgeschlagen'}
                </p>
                <p className="text-xs mt-0.5 opacity-90">{simResult.message || simResult.error}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden" id="stripe-payments-history">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 text-gray-700 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{t('adminBillingPaymentsHistory')}</h3>
              <p className="text-xs text-gray-500">Alle über Stripe oder manuell gebuchten Guthaben-Eingänge</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {payments.length} Einträge
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Datum / Zeit</th>
                <th className="py-3 px-4">Therapeut</th>
                <th className="py-3 px-4">Typ</th>
                <th className="py-3 px-4">Betrag</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Referenz / Notiz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingPayments ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-300" />
                    Zahlungsdaten werden geladen...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Bisher wurden noch keine Guthaben-Einzahlungen getätigt.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 text-gray-600 font-mono whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{p.therapistName || p.therapistId}</div>
                      {p.therapistEmail && (
                        <div className="text-[11px] text-gray-400">{p.therapistEmail}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {p.type === 'initial_deposit'
                          ? 'Startguthaben'
                          : p.type === 'auto_reload'
                          ? 'Auto-Nachbuchung'
                          : p.type === 'package_purchase'
                          ? 'Paket-Kauf'
                          : 'Aufladung'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm whitespace-nowrap">
                      +{p.amountEur.toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Erfolgreich
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px] max-w-xs truncate">
                      {p.note || p.stripeSessionId || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
