import React, { useState, useEffect, useMemo } from 'react';
import { Therapist, BillingDepositRecord } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Wallet,
  TrendingUp,
  Receipt,
  PieChart as PieIcon,
  BarChart3,
  RefreshCw,
  Coins,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  fetchTherapistBalance,
  TherapistBalanceResponse
} from '../services/stripeBillingService';
import {
  fetchTokenBillingSummary,
  fetchTokenLogs
} from '../services/tokenBillingService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TherapistBillingAnalyticsProps {
  therapist: Therapist;
  showOnlySection?: 'all' | 'charts_only' | 'history_only';
}

export const TherapistBillingAnalytics: React.FC<TherapistBillingAnalyticsProps> = ({
  therapist,
  showOnlySection = 'all'
}) => {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [billingInfo, setBillingInfo] = useState<TherapistBalanceResponse | null>(null);
  const [totalAiCostEur, setTotalAiCostEur] = useState<number>(0);
  const [timelineData, setTimelineData] = useState<Array<{
    period: string;
    deposited: number;
    usage: number;
  }>>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load therapist specific balance & deposit records
      const balanceData = await fetchTherapistBalance(therapist.id);
      if (balanceData) {
        setBillingInfo(balanceData);
      }

      // 2. Load token billing summary to get accurate AI customer cost for this therapist
      const summaryData = await fetchTokenBillingSummary();
      let calculatedCost = 0;
      if (summaryData && Array.isArray(summaryData.byTherapist)) {
        const mySummary = summaryData.byTherapist.find(
          tItem => tItem.therapistId === therapist.id
        );
        if (mySummary) {
          calculatedCost = mySummary.totalCustomerCostEur || mySummary.customerCostEur || mySummary.totalCostEur || 0;
        }
      }

      // 3. Load logs to construct monthly consumption timeline
      const logs = await fetchTokenLogs(therapist.id, 500);

      // Build 6-month timeline structure
      const now = new Date();
      const monthBuckets: Record<string, { deposited: number; usage: number; label: string }> = {};
      
      const localeMap: Record<string, string> = {
        de: 'de-DE',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        it: 'it-IT',
        el: 'el-GR',
        ru: 'ru-RU',
      };
      const activeLocale = localeMap[language] || 'de-DE';

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleDateString(activeLocale, { month: 'short' });
        monthBuckets[key] = {
          deposited: 0,
          usage: 0,
          label: `${monthName} ${String(d.getFullYear()).slice(-2)}`
        };
      }

      // Aggregate payments by month
      const payments = balanceData?.recentPayments || [];
      payments.forEach(p => {
        const monthKey = p.month || (p.createdAt ? p.createdAt.slice(0, 7) : '');
        if (monthBuckets[monthKey]) {
          monthBuckets[monthKey].deposited += Number(p.amountEur) || 0;
        }
      });

      // Aggregate token costs by month
      logs.forEach(log => {
        const logDate = log.timestamp ? log.timestamp.slice(0, 7) : '';
        const custCost = (log as any).customerCostEur || log.costEur || 0;
        if (monthBuckets[logDate]) {
          monthBuckets[logDate].usage += Number(custCost) || 0;
        }
      });

      // If calculatedCost was 0 but logs had cost, sum them
      const logsSum = logs.reduce((sum, l) => sum + ((l as any).customerCostEur || l.costEur || 0), 0);
      setTotalAiCostEur(calculatedCost > 0 ? calculatedCost : logsSum);

      const timelineArr = Object.keys(monthBuckets).map(key => ({
        period: monthBuckets[key].label,
        deposited: Math.round(monthBuckets[key].deposited * 100) / 100,
        usage: Math.round(monthBuckets[key].usage * 100) / 100
      }));

      setTimelineData(timelineArr);
    } catch (err) {
      console.error('Failed to load therapist billing analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleBalanceChanged = () => {
      loadData();
    };
    window.addEventListener('homoeo_billing_balance_changed', handleBalanceChanged);
    return () => {
      window.removeEventListener('homoeo_billing_balance_changed', handleBalanceChanged);
    };
  }, [therapist.id, language]);

  const totalDeposited = billingInfo?.totalDepositedEur || 0;
  const currentBalance = Math.max(0, billingInfo?.balanceEur || 0);
  const totalUsage = totalAiCostEur > 0 
    ? totalAiCostEur 
    : Math.max(0, Math.round((totalDeposited - currentBalance) * 100) / 100);

  const paymentsList = billingInfo?.recentPayments || [];
  const successfulPayments = paymentsList.filter(p => p.status === 'succeeded' || !p.status);
  const depositCount = successfulPayments.length;
  const avgDeposit = depositCount > 0 ? totalDeposited / depositCount : 0;

  // Format Helpers
  const formatEur = (num: number) => {
    return (num || 0).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' €';
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return t('therapistStatNoDepositsYet');
    try {
      const localeMap: Record<string, string> = {
        de: 'de-DE',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        it: 'it-IT',
        el: 'el-GR',
        ru: 'ru-RU',
      };
      return new Date(isoString).toLocaleDateString(localeMap[language] || 'de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'initial_deposit':
        return t('therapistTypeInitialDeposit');
      case 'auto_reload':
        return t('therapistTypeAutoReload');
      case 'package_purchase':
        return t('therapistTypePackagePurchase');
      case 'manual_reload':
      default:
        return t('therapistTypeManualReload');
    }
  };

  // Pie chart breakdown: Restguthaben vs. Verbraucht
  const pieData = useMemo(() => {
    const remaining = Math.max(0, currentBalance);
    const consumed = Math.max(0, totalUsage);
    if (remaining === 0 && consumed === 0) {
      return [
        { name: t('therapistChartRemainingLegend'), value: 1, color: '#0d9488' }
      ];
    }
    return [
      { name: t('therapistChartRemainingLegend'), value: remaining, color: '#0d9488' }, // Teal
      { name: t('therapistChartConsumedLegend'), value: consumed, color: '#6366f1' },  // Indigo
    ];
  }, [currentBalance, totalUsage, t]);

  const remainingPercent = (totalDeposited > 0)
    ? Math.min(100, Math.round((currentBalance / totalDeposited) * 100))
    : (currentBalance > 0 ? 100 : 0);

  return (
    <div className="space-y-6" id="therapist-billing-analytics">
      {/* 4 HIGH-CONTRAST KPI METRIC TILES & CHARTS */}
      {showOnlySection !== 'history_only' && (
        <>
          {/* SECTION HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                {t('therapistBillingAnalyticsTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('therapistBillingAnalyticsSubtitle')}
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
              title="Aktualisieren"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              <span>{t('adminTokensRefresh')}</span>
            </button>
          </div>

          {/* 4 HIGH-CONTRAST KPI METRIC TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Restguthaben (Primary Focus) */}
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-teal-800/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                {t('therapistStatBalanceRemaining')}
              </span>
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-1">
              {formatEur(currentBalance)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-teal-500/20 flex items-center justify-between text-xs text-teal-200/90">
            <span>{remainingPercent}% des Einzahlbetrags</span>
            <span className="font-semibold text-emerald-400">Verfügbar</span>
          </div>
        </div>

        {/* Tile 2: Gesamt zugebucht */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t('therapistStatDepositedTotal')}
              </span>
              <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 mt-1">
              {formatEur(totalDeposited)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{depositCount} {t('therapistStatDepositCountSub')}</span>
            <span className="font-mono text-slate-700 font-semibold">100% Basis</span>
          </div>
        </div>

        {/* Tile 3: Bisheriger KI-Verbrauch */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t('therapistStatTotalUsage')}
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-indigo-950 mt-1">
              {formatEur(totalUsage)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Admin-Tarifpreis Abrechnung</span>
            <span className="font-semibold text-indigo-600">Repertorisation</span>
          </div>
        </div>

        {/* Tile 4: Zubuchungen Statistik (Anzahl & Schnitt) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t('therapistStatDepositCount')}
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{depositCount}</span>
              <span className="text-xs font-medium text-slate-500 font-sans">
                (Ø {formatEur(avgDeposit)})
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 truncate">
            <span>{t('therapistStatLastDeposit')}:</span>
            <span className="font-semibold text-slate-700 truncate max-w-[130px]" title={formatDate(billingInfo?.lastDepositAt)}>
              {billingInfo?.lastDepositAt ? formatDate(billingInfo.lastDepositAt).split(',')[0] : t('therapistStatNoDepositsYet')}
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER (DONUT & TIMELINE BAR CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donut Gauge - Verhältnis Restguthaben zu Gesamtverbrauch */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-teal-600" />
                {t('therapistChartGaugeTitle')}
              </h4>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                {remainingPercent}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {t('therapistChartGaugeSub')}
            </p>

            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatEur(Number(val))}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Metric in Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">Rest</span>
                <span className="text-lg font-black font-mono text-slate-900">
                  {formatEur(currentBalance).replace(' €', '')}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">EUR</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <span className="text-slate-600">{t('therapistChartRemainingLegend')}</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{formatEur(currentBalance)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-600">{t('therapistChartConsumedLegend')}</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{formatEur(totalUsage)}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Timeline Bar Chart - Zugebucht vs. Verbraucht über Monate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-600" />
                {t('therapistChartTimelineTitle')}
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                Letzte 6 Monate
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {t('therapistChartTimelineSub')}
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}€`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatEur(Number(val))}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                  />
                  <Bar
                    dataKey="deposited"
                    name={t('therapistChartDepositedLegend')}
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Bar
                    dataKey="usage"
                    name={t('therapistChartCostLegend')}
                    fill="#0d9488"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Datenbasis: Abrechnungstarife gemäß Praxis-Admin</span>
            <span className="font-mono text-slate-700">Gesamteinzahlung: {formatEur(totalDeposited)}</span>
          </div>
        </div>
      </div>
        </>
      )}

      {/* STATISTIK DER ZUBUCHUNGEN (TABELLE & DETAILÜBERSICHT) */}
      {showOnlySection !== 'charts_only' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-teal-600" />
              {t('therapistTopUpHistoryTitle')}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('therapistTopUpHistorySubtitle')} ({successfulPayments.length} Buchungen)
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL revisionssicher dokumentiert</span>
          </div>
        </div>

        {paymentsList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {t('therapistTopUpEmpty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t('therapistTopUpColDate')}</th>
                  <th className="py-3 px-4">{t('therapistTopUpColType')}</th>
                  <th className="py-3 px-4">{t('therapistTopUpColNote')}</th>
                  <th className="py-3 px-4 text-center">{t('therapistTopUpColStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('therapistTopUpColAmount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentsList.map((payment) => {
                  const isSuccess = payment.status === 'succeeded' || !payment.status;
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(payment.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800">
                          {getTypeLabel(payment.type)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={payment.note}>
                        {payment.note || 'Guthaben-Aufladung'}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {t('therapistStatusSucceeded')}
                          </span>
                        ) : payment.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {t('therapistStatusPending')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            {t('therapistStatusFailed')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                        +{formatEur(payment.amountEur)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
