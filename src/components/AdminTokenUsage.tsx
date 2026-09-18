import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Coins,
  RefreshCw,
  Download,
  Search,
  Filter,
  TrendingUp,
  Database,
  Cpu,
  Receipt,
  RotateCcw,
  Sliders,
  CheckCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  Percent,
  Save,
  HelpCircle,
  Check,
  CreditCard,
  PlusCircle,
  AlertTriangle,
  Wallet,
  DollarSign,
  X
} from 'lucide-react';
import {
  FreeTrialLimitConfig,
  ModelPricingTier,
  TokenBillingSummary,
  TokenUsageRecord,
  TherapistTokenSummary,
  TokenPricingRates
} from '../types';
import {
  fetchTokenBillingSummary,
  fetchTokenLogs,
  updateTokenRates,
  resetTokenLogs,
  exportTokenBillingCsv,
  formatCostEur,
  formatTokenCount,
  formatSingleTokenCost,
  DEFAULT_MODEL_TIERS
} from '../services/tokenBillingService';
import {
  getFreeTrialLimitConfig,
  saveFreeTrialLimitConfig
} from '../services/storage';
import { adminAdjustTherapistBalance } from '../services/stripeBillingService';

export const AdminTokenUsage: React.FC = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<TokenBillingSummary | null>(null);
  const [logs, setLogs] = useState<TokenUsageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'therapists' | 'logs' | 'rates'>('therapists');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTherapistId, setFilterTherapistId] = useState<string>('all');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Financial Reporting & Table View Mode
  const [viewMode, setViewMode] = useState<'financial' | 'tokens' | 'all'>('financial');
  const [adjustModalOpen, setAdjustModalOpen] = useState<boolean>(false);
  const [selectedTherapistForAdjust, setSelectedTherapistForAdjust] = useState<TherapistTokenSummary | null>(null);
  const [adjustAmountEur, setAdjustAmountEur] = useState<number>(20);
  const [adjustNote, setAdjustNote] = useState<string>('Manuelle Gutschrift durch Administrator');
  const [adjustLoading, setAdjustLoading] = useState<boolean>(false);

  // Rate & Model Tiers Editing
  const [editingRates, setEditingRates] = useState<TokenPricingRates>({
    inputPerMillionEur: 0.69,
    outputPerMillionEur: 3.45,
    cachedPerMillionEur: 0.069,
    currency: '€'
  });
  const [modelTiers, setModelTiers] = useState<ModelPricingTier[]>(DEFAULT_MODEL_TIERS);
  const [savingRates, setSavingRates] = useState<boolean>(false);

  // Free Trial Quota Configuration State
  const [trialLimitConfig, setTrialLimitConfig] = useState<FreeTrialLimitConfig>(() => getFreeTrialLimitConfig());
  const [savingTrialLimit, setSavingTrialLimit] = useState<boolean>(false);

  // Unit and Timeframe toggles for Rates & Margins table
  const [priceUnit, setPriceUnit] = useState<'perMillion' | 'perSingleToken'>('perMillion');
  const [ratesTimeframe, setRatesTimeframe] = useState<'current' | 'future2027'>('current');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const summaryData = await fetchTokenBillingSummary();
      setSummary(summaryData);
      setEditingRates(summaryData.rates);
      if (summaryData.rates.modelTiers && summaryData.rates.modelTiers.length > 0) {
        setModelTiers(summaryData.rates.modelTiers);
      } else {
        setModelTiers(DEFAULT_MODEL_TIERS);
      }

      const logsData = await fetchTokenLogs(filterTherapistId, 250);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load token billing data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterTherapistId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRates(true);
    try {
      const updatedRatesPayload: TokenPricingRates = {
        ...editingRates,
        modelTiers
      };
      await updateTokenRates(updatedRatesPayload);
      await loadData(true);
      showToast(t('adminTokensSavedSuccess'));
    } catch (err) {
      console.error('Failed to update rates:', err);
      showToast('Fehler beim Speichern der Tarife');
    } finally {
      setSavingRates(false);
    }
  };

  const handleSaveTrialLimits = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTrialLimit(true);
    try {
      saveFreeTrialLimitConfig(trialLimitConfig);
      setTimeout(() => {
        setSavingTrialLimit(false);
        showToast(t('adminTokensSavedSuccess'));
      }, 200);
    } catch (err) {
      console.error('Failed to save trial limits:', err);
      setSavingTrialLimit(false);
    }
  };

  const handleModelTierCustomerPriceChange = (
    index: number,
    field: 'customerInputPerMillionEur' | 'customerOutputPerMillionEur' | 'customerCachedPerMillionEur',
    val: number
  ) => {
    setModelTiers(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: val
      };
      return copy;
    });
  };

  const handleResetLogs = async () => {
    try {
      await resetTokenLogs();
      setIsResetConfirmOpen(false);
      await loadData();
      showToast('Token-Protokoll wurde erfolgreich zurückgesetzt.');
    } catch (err) {
      console.error('Failed to reset token logs:', err);
    }
  };

  const handleExportCsv = () => {
    if (!summary) return;
    exportTokenBillingCsv(summary);
  };

  // Filter therapists
  const filteredTherapists = (summary?.byTherapist || []).filter((th) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      th.therapistName.toLowerCase().includes(q) ||
      th.therapistEmail.toLowerCase().includes(q) ||
      th.praxisName.toLowerCase().includes(q) ||
      th.tarifLabel.toLowerCase().includes(q)
    );
  });

  // Financial Live Reporting Aggregations
  const totalCustomerBalance = (summary?.byTherapist || []).reduce((sum, th) => sum + (th.balanceEur || 0), 0);
  const totalMonthDeposited = (summary?.byTherapist || []).reduce((sum, th) => sum + (th.currentMonthDepositedEur || 0), 0);
  const totalMonthConsumed = (summary?.byTherapist || []).reduce((sum, th) => sum + (th.currentMonthCostEur || 0), 0);
  const totalAllTimeDeposited = (summary?.byTherapist || []).reduce((sum, th) => sum + (th.totalDepositedEur || 0), 0);
  const totalAllTimeConsumed = (summary?.byTherapist || []).reduce((sum, th) => sum + (th.totalCustomerCostEur || 0), 0);
  const lowBalanceCount = (summary?.byTherapist || []).filter((th) => th.isLowBalance).length;

  const handleOpenAdjustModal = (th: TherapistTokenSummary) => {
    setSelectedTherapistForAdjust(th);
    setAdjustAmountEur(20);
    setAdjustNote(`Manuelle Gutschrift für ${th.therapistName}`);
    setAdjustModalOpen(true);
  };

  const handleConfirmAdjust = async () => {
    if (!selectedTherapistForAdjust) return;
    setAdjustLoading(true);
    try {
      const res = await adminAdjustTherapistBalance(
        selectedTherapistForAdjust.therapistId,
        adjustAmountEur,
        adjustNote
      );
      if (res?.success) {
        showToast(`Guthaben von ${selectedTherapistForAdjust.therapistName} erfolgreich um ${adjustAmountEur} € angepasst.`);
        setAdjustModalOpen(false);
        await loadData(true);
      } else {
        showToast('Fehler beim Anpassen des Guthabens.');
      }
    } catch (err) {
      console.error('Error adjusting balance:', err);
      showToast('Verbindungsfehler beim Anpassen des Guthabens.');
    } finally {
      setAdjustLoading(false);
    }
  };

  const avgCostPerRequest =
    summary && summary.totalRequests > 0
      ? summary.totalCostEur / summary.totalRequests
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-teal-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {t('adminTokensTitle')}
                </h2>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {t('adminTokensRealtimeActive')}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {t('adminTokensSubtitle')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title={t('adminTokensRefresh')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-400' : ''}`} />
              <span>{t('adminTokensRefresh')}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('adminTokensExportCsv')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-700/50 transition-all cursor-pointer"
              title={t('adminTokensResetLogs')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Summary Cards (Input, Output, Cached, Costs & Margins) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          {/* Card 1: Costs (Einkauf vs Kunde) */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('adminTokensCostWhatIPay')}</span>
            </div>
            <div className="text-2xl font-bold text-teal-300 mt-2 font-mono">
              {formatCostEur(summary?.totalCostEur || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{t('adminTokensCostWhatCustomerPays')}:</span>
              <span className="font-mono text-emerald-300 font-semibold">{formatCostEur(summary?.totalCustomerCostEur || 0)}</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center justify-between">
              <span>{t('adminTokensMargin')}:</span>
              <span>+{formatCostEur(summary?.totalMarginEur || 0)} ({summary?.marginPercent || 0}%)</span>
            </div>
          </div>

          {/* Card 2: Total Tokens (Input, Output, Cached) */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('adminTokensTotalTokens')}</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              {formatTokenCount(summary?.totalTokens || 0)}
            </div>
            <div className="text-[11px] text-slate-300 mt-1 flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">1. {t('adminTokensInputTokens')}:</span>
                <span className="font-mono">{formatTokenCount(summary?.totalPromptTokens || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">2. {t('adminTokensOutputTokens')}:</span>
                <span className="font-mono">{formatTokenCount(summary?.totalCandidatesTokens || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-teal-300">
                <span className="text-slate-400">3. {t('adminTokensCachedTokens')}:</span>
                <span className="font-mono">{formatTokenCount(summary?.totalCachedTokens || 0)}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Requests */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('adminTokensTotalRequests')}</span>
            </div>
            <div className="text-2xl font-bold text-sky-300 mt-2 font-mono">
              {summary?.totalRequests || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Erfasste API-Aufrufe aller Praxen
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Live aus /api/analyze & Repertorisation
            </div>
          </div>

          {/* Card 4: Avg Cost per Request */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('adminTokensAvgCostPerReq')}</span>
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-2 font-mono">
              {formatCostEur(avgCostPerRequest)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Ø Einkaufspreis pro Fallanalyse
            </div>
            <div className="text-[10px] text-teal-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>90% Ersparnis bei Kontext-Caching</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('therapists')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'therapists'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{t('adminTokensTabTherapists')}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
            {summary?.byTherapist?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t('adminTokensTabLogs')}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
            {logs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('rates')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'rates'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t('adminTokensTabPricingMatrix')}</span>
        </button>
      </div>

      {/* Sub-Tab 1: Therapists Breakdown Table & Financial Live Reporting */}
      {activeSubTab === 'therapists' && (
        <div className="space-y-4">
          {/* 4 Financial Live Reporting Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Customer Remaining Balance */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-teal-600" />
                  {t('adminBillingBalance')} (Alle Kunden)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-100 text-teal-700 font-bold">Live</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {totalCustomerBalance.toFixed(2)} €
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Aktives Restguthaben auf Praxis-Konten
              </div>
            </div>

            {/* Card 2: Deposited this month */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  {t('adminBillingMonthDeposited')}
                </span>
                <span className="font-mono text-emerald-600 text-xs font-bold">+{totalMonthDeposited.toFixed(2)} €</span>
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
                +{totalMonthDeposited.toFixed(2)} €
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>{t('adminBillingTotalDeposited')}:</span>
                <span className="font-mono font-semibold text-slate-700">{totalAllTimeDeposited.toFixed(2)} €</span>
              </div>
            </div>

            {/* Card 3: Consumed this month */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
                  {t('adminBillingMonthConsumed')}
                </span>
                <span className="font-mono text-amber-600 text-xs font-bold">-{totalMonthConsumed.toFixed(2)} €</span>
              </div>
              <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">
                -{totalMonthConsumed.toFixed(2)} €
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>{t('adminBillingTotalConsumed')}:</span>
                <span className="font-mono font-semibold text-slate-700">{totalAllTimeConsumed.toFixed(2)} €</span>
              </div>
            </div>

            {/* Card 4: Low Balance Threshold Warnings */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  {t('adminBillingThresholdAlert')}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lowBalanceCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {lowBalanceCount > 0 ? `${lowBalanceCount} Alarm(e)` : 'Alles OK'}
                </span>
              </div>
              <div className={`text-2xl font-bold mt-2 font-mono ${lowBalanceCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {lowBalanceCount} {lowBalanceCount === 1 ? 'Praxis' : 'Praxen'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {lowBalanceCount > 0 ? 'Guthaben unter Schwellenwert gefallen' : 'Alle Konten über Schwellenwert'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Controls & View Mode Switcher */}
            <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('adminTokensSearchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* View Switcher: Financial vs Tokens vs All */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex p-1 bg-slate-200/60 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setViewMode('financial')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'financial'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('adminBillingViewFinancial')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('tokens')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'tokens'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('adminBillingViewTokens')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('adminBillingViewAll')}
                  </button>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2 px-2">
                  <span>{filteredTherapists.length} Therapeuten gelistet</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">{t('adminTokensColTherapist')}</th>
                    <th className="py-3.5 px-4">{t('adminTokensColTariff')}</th>

                    {/* Financial Columns */}
                    {(viewMode === 'financial' || viewMode === 'all') && (
                      <>
                        <th className="py-3.5 px-4 text-right font-bold text-slate-900 bg-teal-50/30">
                          {t('adminBillingBalance')} (Live)
                        </th>
                        <th className="py-3.5 px-4 text-right font-bold text-emerald-800">
                          {t('adminBillingMonthDeposited')}
                        </th>
                        <th className="py-3.5 px-4 text-right font-bold text-amber-800">
                          {t('adminBillingMonthConsumed')}
                        </th>
                        <th className="py-3.5 px-4 text-right text-slate-700">
                          {t('adminBillingTotalDeposited')}
                        </th>
                        <th className="py-3.5 px-4 text-right text-slate-700">
                          {t('adminBillingTotalConsumed')}
                        </th>
                        <th className="py-3.5 px-4 text-center">
                          {t('adminBillingThreshold')}
                        </th>
                      </>
                    )}

                    {/* Token Analysis Columns */}
                    {(viewMode === 'tokens' || viewMode === 'all') && (
                      <>
                        <th className="py-3.5 px-4 text-center">{t('adminTokensColRequests')}</th>
                        <th className="py-3.5 px-4 text-right">{t('adminTokensColPromptTokens')}</th>
                        <th className="py-3.5 px-4 text-right">{t('adminTokensColCandidatesTokens')}</th>
                        <th className="py-3.5 px-4 text-right text-teal-700">{t('adminTokensColCachedTokens')}</th>
                        <th className="py-3.5 px-4 text-right font-bold text-slate-900">{t('adminTokensColTotalTokens')}</th>
                        <th className="py-3.5 px-4 text-right font-bold text-teal-800 bg-teal-50/40">{t('adminTokensCostWhatIPay')}</th>
                        <th className="py-3.5 px-4 text-right font-bold text-emerald-800 bg-emerald-50/40">{t('adminTokensCostWhatCustomerPays')}</th>
                        <th className="py-3.5 px-4 text-right font-bold text-indigo-800 bg-indigo-50/40">{t('adminTokensMargin')}</th>
                      </>
                    )}

                    <th className="py-3.5 px-4">{t('adminTokensColLastUsed')}</th>
                    {(viewMode === 'financial' || viewMode === 'all') && (
                      <th className="py-3.5 px-4 text-center">Aktionen</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTherapists.length === 0 ? (
                    <tr>
                      <td colSpan={viewMode === 'all' ? 17 : viewMode === 'financial' ? 10 : 11} className="py-12 text-center text-slate-400">
                        {t('adminTokensNoTherapistsFound')}
                      </td>
                    </tr>
                  ) : (
                    filteredTherapists.map((th) => {
                      const isLow = th.isLowBalance;
                      const isEmpty = (th.balanceEur || 0) <= 0;

                      return (
                        <tr
                          key={th.therapistId}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Therapist / Praxis */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 text-sm">
                              {th.therapistName}
                            </div>
                            {th.praxisName && (
                              <div className="text-[11px] text-slate-500">
                                {th.praxisName}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 font-mono">
                              {th.therapistEmail}
                            </div>
                          </td>

                          {/* Tariff */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              {th.tarifLabel || 'Standard'}
                            </span>
                          </td>

                          {/* Financial Columns */}
                          {(viewMode === 'financial' || viewMode === 'all') && (
                            <>
                              {/* Restguthaben (Live) */}
                              <td className="py-3.5 px-4 text-right font-mono bg-teal-50/20 group-hover:bg-teal-50/40">
                                <div className="font-extrabold text-sm text-slate-900">
                                  {(th.balanceEur || 0).toFixed(2)} €
                                </div>
                                <div className="mt-0.5">
                                  {isEmpty ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                      {t('adminBillingStatusEmpty')}
                                    </span>
                                  ) : isLow ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      <AlertTriangle className="w-3 h-3" />
                                      {t('adminBillingStatusLow')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      {t('adminBillingStatusOk')}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Lfd. Monat Aufgefüllt */}
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                                +{(th.currentMonthDepositedEur || 0).toFixed(2)} €
                              </td>

                              {/* Lfd. Monat Verbraucht */}
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                                -{(th.currentMonthCostEur || 0).toFixed(2)} €
                              </td>

                              {/* Gesamt Bezahlt */}
                              <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                                +{(th.totalDepositedEur || 0).toFixed(2)} €
                              </td>

                              {/* Gesamt Verbraucht */}
                              <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                                -{(th.totalCustomerCostEur || 0).toFixed(2)} €
                              </td>

                              {/* Schwellenwert */}
                              <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                                &lt; {(th.lowBalanceThreshold || 5).toFixed(2)} €
                              </td>
                            </>
                          )}

                          {/* Token Analysis Columns */}
                          {(viewMode === 'tokens' || viewMode === 'all') && (
                            <>
                              {/* Request Count */}
                              <td className="py-3.5 px-4 text-center">
                                <span className="font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs">
                                  {th.requestCount}
                                </span>
                              </td>

                              {/* Input Tokens */}
                              <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                                {formatTokenCount(th.promptTokens)}
                              </td>

                              {/* Output Tokens */}
                              <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                                {formatTokenCount(th.candidatesTokens)}
                              </td>

                              {/* Cached Tokens */}
                              <td className="py-3.5 px-4 text-right font-mono text-teal-600 font-medium">
                                {formatTokenCount(th.cachedTokens || 0)}
                              </td>

                              {/* Total Tokens */}
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                                {formatTokenCount(th.totalTokens)}
                              </td>

                              {/* Cost to Me (Einkaufspreis) */}
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-800 bg-teal-50/30 group-hover:bg-teal-50/60">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-teal-100/70 text-teal-900 text-xs">
                                  {formatCostEur(th.totalCostEur)}
                                </span>
                              </td>

                              {/* What Customer Pays */}
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-800 bg-emerald-50/30 group-hover:bg-emerald-50/60">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-900 text-xs">
                                  {formatCostEur(th.customerCostEur || 0)}
                                </span>
                              </td>

                              {/* Margin */}
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-800 bg-indigo-50/30 group-hover:bg-indigo-50/60">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-100/70 text-indigo-900 text-xs">
                                  +{formatCostEur(th.marginEur || 0)}
                                </span>
                              </td>
                            </>
                          )}

                          {/* Last Activity */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {th.lastUsedAt ? (
                              <div>
                                <div>{new Date(th.lastUsedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {new Date(th.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Uhr
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Noch keine</span>
                            )}
                          </td>

                          {/* Actions: Manual Balance Adjustment */}
                          {(viewMode === 'financial' || viewMode === 'all') && (
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenAdjustModal(th)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                                title="Guthaben manuell anpassen oder gutschreiben"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Guthaben</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for Manual Balance Adjustment */}
          {adjustModalOpen && selectedTherapistForAdjust && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-md w-full space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {t('adminBillingManualTopUp')}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {selectedTherapistForAdjust.therapistName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdjustModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Current Balance Display */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">{t('adminBillingBalance')} (Aktuell):</span>
                  <span className="text-base font-mono font-bold text-slate-900">
                    {(selectedTherapistForAdjust.balanceEur || 0).toFixed(2)} €
                  </span>
                </div>

                {/* Amount Quick Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    {t('adminBillingDepositAmount')}
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAdjustAmountEur(amt)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          adjustAmountEur === amt
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        +{amt} €
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={adjustAmountEur}
                    onChange={(e) => setAdjustAmountEur(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                  />
                </div>

                {/* Note / Reason */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verwendungszweck / Notiz
                  </label>
                  <input
                    type="text"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="z.B. Manuelle Gutschrift durch Administrator"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    disabled={adjustLoading || adjustAmountEur === 0}
                    onClick={handleConfirmAdjust}
                    className="px-4 py-2 text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {adjustLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t('adminBillingDepositBtn')} (+{adjustAmountEur} €)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Live Request Log Table */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">{t('adminTokensFilterTherapist')}:</span>
              <select
                value={filterTherapistId}
                onChange={(e) => setFilterTherapistId(e.target.value)}
                className="text-xs bg-white rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="all">{t('adminTokensAllTherapists')}</option>
                {(summary?.byTherapist || []).map((th) => (
                  <option key={th.therapistId} value={th.therapistId}>
                    {th.therapistName} ({th.requestCount} Aufrufe)
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Die letzten {logs.length} Aufrufe
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{t('adminTokensColTime')}</th>
                  <th className="py-3.5 px-4">{t('adminTokensColTherapist')}</th>
                  <th className="py-3.5 px-4">{t('adminTokensColAction')}</th>
                  <th className="py-3.5 px-4">{t('adminTokensColModel')}</th>
                  <th className="py-3.5 px-4 text-right">{t('adminTokensColPromptTokens')}</th>
                  <th className="py-3.5 px-4 text-right">{t('adminTokensColCandidatesTokens')}</th>
                  <th className="py-3.5 px-4 text-right text-teal-700">{t('adminTokensColCachedTokens')}</th>
                  <th className="py-3.5 px-4 text-right font-bold text-slate-900">{t('adminTokensColTotalTokens')}</th>
                  <th className="py-3.5 px-4 text-right font-bold text-teal-700 bg-teal-50/50">{t('adminTokensCostWhatIPay')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      {t('adminTokensNoLogs')}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors font-mono">
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-sans text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Therapist */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-slate-900">{log.therapistName}</div>
                        <div className="text-[10px] text-slate-400">{log.therapistEmail}</div>
                      </td>

                      {/* Action / Endpoint */}
                      <td className="py-3 px-4 font-sans">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/60 font-medium text-[11px]">
                          <Sparkles className="w-3 h-3 text-sky-500" />
                          {log.actionName || log.endpoint}
                        </span>
                      </td>

                      {/* Model */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {log.model}
                      </td>

                      {/* Input Tokens */}
                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatTokenCount(log.promptTokens)}
                      </td>

                      {/* Output Tokens */}
                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatTokenCount(log.candidatesTokens)}
                      </td>

                      {/* Cached Tokens */}
                      <td className="py-3 px-4 text-right text-teal-600 font-medium">
                        {formatTokenCount(log.cachedTokens || 0)}
                      </td>

                      {/* Total Tokens */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatTokenCount(log.totalTokens)}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right font-bold text-teal-700 bg-teal-50/40">
                        <span className="px-2 py-0.5 rounded-md bg-teal-100/80 text-teal-900">
                          {formatCostEur(log.costEur)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Tarife, Margen & Kontingente */}
      {activeSubTab === 'rates' && (
        <div className="space-y-6">
          {/* Card 1: Free Trial Quota Management (Begrenzung Analysen, Tokens oder Beides) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-start justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {t('adminTokensFreeTierLimitTitle')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('adminTokensFreeTierLimitDesc')}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveTrialLimits} className="space-y-5">
              {/* Radio options for 3 modes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Option 1: Analyses Only */}
                <label
                  onClick={() => setTrialLimitConfig({ ...trialLimitConfig, limitMode: 'analyses_only' })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    trialLimitConfig.limitMode === 'analyses_only'
                      ? 'border-teal-500 bg-teal-50/30 text-teal-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">1. {t('adminTokensLimitModeAnalysesOnly')}</span>
                    <input
                      type="radio"
                      name="trial_limit_mode"
                      checked={trialLimitConfig.limitMode === 'analyses_only'}
                      onChange={() => setTrialLimitConfig({ ...trialLimitConfig, limitMode: 'analyses_only' })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Therapeut kann exakt {trialLimitConfig.maxAnalyses} Fallanalysen durchführen, Token-Verbrauch ist frei.
                  </p>
                </label>

                {/* Option 2: Tokens Only */}
                <label
                  onClick={() => setTrialLimitConfig({ ...trialLimitConfig, limitMode: 'tokens_only' })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    trialLimitConfig.limitMode === 'tokens_only'
                      ? 'border-teal-500 bg-teal-50/30 text-teal-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">2. {t('adminTokensLimitModeTokensOnly')}</span>
                    <input
                      type="radio"
                      name="trial_limit_mode"
                      checked={trialLimitConfig.limitMode === 'tokens_only'}
                      onChange={() => setTrialLimitConfig({ ...trialLimitConfig, limitMode: 'tokens_only' })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Begrenzt strikt nach verbrauchten Tokens ({formatTokenCount(trialLimitConfig.maxTokens)}). Beliebig viele kurze Anfragen.
                  </p>
                </label>

                {/* Option 3: Both (Whichever first) */}
                <label
                  onClick={() => setTrialLimitConfig({ ...trialLimitConfig, limitMode: 'both_whichever_first' })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    trialLimitConfig.limitMode === 'both_whichever_first'
                      ? 'border-teal-500 bg-teal-50/30 text-teal-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">3. {t('adminTokensLimitModeBoth')}</span>
                    <input
                      type="radio"
                      name="trial_limit_mode"
                      checked={trialLimitConfig.limitMode === 'both_whichever_first'}
                      onChange={() => setTrialLimitConfig({ ...trialLimitConfig, limitMode: 'both_whichever_first' })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Sperrt automatisch, sobald entweder {trialLimitConfig.maxAnalyses} Analysen ODER {formatTokenCount(trialLimitConfig.maxTokens)} Tokens erreicht sind.
                  </p>
                </label>
              </div>

              {/* Number Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('adminTokensMaxAnalysesLabel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={trialLimitConfig.maxAnalyses}
                    onChange={(e) =>
                      setTrialLimitConfig({
                        ...trialLimitConfig,
                        maxAnalyses: Math.max(1, parseInt(e.target.value, 10) || 1)
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Standard: 3 Analysen</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('adminTokensMaxTokensLabel')}
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    max="1000000"
                    value={trialLimitConfig.maxTokens}
                    onChange={(e) =>
                      setTrialLimitConfig({
                        ...trialLimitConfig,
                        maxTokens: Math.max(1000, parseInt(e.target.value, 10) || 1000)
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Standard: 25.000 Tokens (~ 3 bis 5 Fallanalysen)</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={savingTrialLimit}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingTrialLimit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Test-Tarif Kontingent speichern</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Pricing & Margins Table for All Gemini Versions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {t('adminTokensTabPricingMatrix')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('adminTokensPricingMatrixDesc')}
                  </p>
                </div>
              </div>

              {/* Toggles: Unit (€/1M vs €/Token) & Timeframe (Current vs 2027) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Timeframe Toggle */}
                <div className="bg-slate-100 p-1 rounded-lg flex items-center text-[11px] font-semibold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRatesTimeframe('current')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      ratesTimeframe === 'current'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('adminTokensYear2026')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatesTimeframe('future2027')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      ratesTimeframe === 'future2027'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('adminTokensYear2027')}
                  </button>
                </div>

                {/* Price Unit Toggle */}
                <div className="bg-slate-100 p-1 rounded-lg flex items-center text-[11px] font-semibold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPriceUnit('perMillion')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      priceUnit === 'perMillion'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    € / 1.000.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceUnit('perSingleToken')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      priceUnit === 'perSingleToken'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    € / 1 Token
                  </button>
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <form onSubmit={handleSaveRates} className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">{t('adminTokensModelVersion')}</th>
                      <th className="py-3 px-3 text-center bg-teal-50/50 text-teal-900" colSpan={3}>
                        {t('adminTokensCostWhatIPay')} ({ratesTimeframe === 'current' ? 'bis 31.12.2026' : 'ab 01.01.2027'})
                      </th>
                      <th className="py-3 px-3 text-center bg-emerald-50/50 text-emerald-900" colSpan={3}>
                        {t('adminTokensCostWhatCustomerPays')} (Editierbar)
                      </th>
                      <th className="py-3 px-3 text-center bg-indigo-50/50 text-indigo-900">
                        {t('adminTokensMargin')}
                      </th>
                    </tr>
                    <tr className="bg-slate-50 text-slate-600 text-[10px] border-b border-slate-200">
                      <th className="py-2 px-3">{t('adminTokensPurpose')}</th>
                      <th className="py-2 px-2 text-right text-slate-600">Input</th>
                      <th className="py-2 px-2 text-right text-slate-600">Output</th>
                      <th className="py-2 px-2 text-right text-teal-700">Cached (-90%)</th>
                      <th className="py-2 px-2 text-right text-slate-700 font-semibold">Input</th>
                      <th className="py-2 px-2 text-right text-slate-700 font-semibold">Output</th>
                      <th className="py-2 px-2 text-right text-teal-700 font-semibold">Cached</th>
                      <th className="py-2 px-3 text-center text-indigo-800">% Aufschlag</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-mono">
                    {modelTiers.map((tier, idx) => {
                      const costInput = ratesTimeframe === 'current' ? tier.costInputPerMillionEur : tier.costInput2027PerMillionEur;
                      const costOutput = ratesTimeframe === 'current' ? tier.costOutputPerMillionEur : tier.costOutput2027PerMillionEur;
                      const costCached = ratesTimeframe === 'current' ? tier.costCachedPerMillionEur : tier.costCached2027PerMillionEur;

                      const custInput = tier.customerInputPerMillionEur;
                      const custOutput = tier.customerOutputPerMillionEur;
                      const custCached = tier.customerCachedPerMillionEur;

                      const avgCost = (costInput + costOutput) / 2;
                      const avgCust = (custInput + custOutput) / 2;
                      const marginEur = Math.max(0, avgCust - avgCost);
                      const marginPct = avgCost > 0 ? Math.round((marginEur / avgCost) * 100) : 0;

                      return (
                        <tr key={tier.modelId} className="hover:bg-slate-50/80 transition-colors">
                          {/* Model & Purpose */}
                          <td className="py-3 px-3 font-sans">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{tier.modelName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs font-normal">
                              {tier.purpose}
                            </div>
                          </td>

                          {/* What I pay: Input */}
                          <td className="py-3 px-2 text-right text-slate-700">
                            {priceUnit === 'perMillion'
                              ? `${costInput.toFixed(3)} €`
                              : formatSingleTokenCost(costInput)}
                          </td>

                          {/* What I pay: Output */}
                          <td className="py-3 px-2 text-right text-slate-700">
                            {priceUnit === 'perMillion'
                              ? `${costOutput.toFixed(3)} €`
                              : formatSingleTokenCost(costOutput)}
                          </td>

                          {/* What I pay: Cached */}
                          <td className="py-3 px-2 text-right text-teal-700 font-semibold bg-teal-50/20">
                            {priceUnit === 'perMillion'
                              ? `${costCached.toFixed(3)} €`
                              : formatSingleTokenCost(costCached)}
                          </td>

                          {/* What Customer Pays: Input (Editable) */}
                          <td className="py-2 px-2 text-right bg-emerald-50/20">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tier.customerInputPerMillionEur}
                              onChange={(e) =>
                                handleModelTierCustomerPriceChange(
                                  idx,
                                  'customerInputPerMillionEur',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-xs text-right rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                            <div className="text-[9px] text-slate-400 text-right mt-0.5">
                              {formatSingleTokenCost(tier.customerInputPerMillionEur)}
                            </div>
                          </td>

                          {/* What Customer Pays: Output (Editable) */}
                          <td className="py-2 px-2 text-right bg-emerald-50/20">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tier.customerOutputPerMillionEur}
                              onChange={(e) =>
                                handleModelTierCustomerPriceChange(
                                  idx,
                                  'customerOutputPerMillionEur',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-xs text-right rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                            <div className="text-[9px] text-slate-400 text-right mt-0.5">
                              {formatSingleTokenCost(tier.customerOutputPerMillionEur)}
                            </div>
                          </td>

                          {/* What Customer Pays: Cached (Editable) */}
                          <td className="py-2 px-2 text-right bg-emerald-50/20">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tier.customerCachedPerMillionEur}
                              onChange={(e) =>
                                handleModelTierCustomerPriceChange(
                                  idx,
                                  'customerCachedPerMillionEur',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 text-xs text-right rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                            <div className="text-[9px] text-slate-400 text-right mt-0.5">
                              {formatSingleTokenCost(tier.customerCachedPerMillionEur)}
                            </div>
                          </td>

                          {/* Margin */}
                          <td className="py-3 px-3 text-center bg-indigo-50/20 font-sans">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 font-mono">
                              +{marginPct}%
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              +{marginEur.toFixed(2)} € / 1M
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Reset & Save Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModelTiers(DEFAULT_MODEL_TIERS)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Auf Standard-Preise & Margen zurücksetzen
                </button>

                <button
                  type="submit"
                  disabled={savingRates}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingRates ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{t('adminTokensSaveRates')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Confirmation */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                {t('adminTokensResetConfirmTitle')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('adminTokensResetConfirmDesc')}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleResetLogs}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                {t('adminTokensResetLogs')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
