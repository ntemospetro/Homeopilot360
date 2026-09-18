import { TokenBillingSummary, TokenPricingRates, TokenUsageRecord, ModelPricingTier, TherapistTokenSummary } from '../types';

export const DEFAULT_MODEL_TIERS: ModelPricingTier[] = [
  {
    modelId: 'gemini-3.8-flash',
    modelName: 'Gemini 3.8 Flash (Klinische Fallanalysen & Repertorisation)',
    purpose: 'Hauptmodell: Vollständige Repertorisation, Miasmen & Toxikologie',
    costInputPerMillionEur: 0.69,       // 0.75 $ bis 31.12.2026
    costOutputPerMillionEur: 3.45,      // 3.75 $ bis 31.12.2026
    costCachedPerMillionEur: 0.069,     // 0.075 $ (90% Rabatt)
    costInput2027PerMillionEur: 1.38,   // 1.50 $ ab 01.01.2027
    costOutput2027PerMillionEur: 6.90,  // 7.50 $ ab 01.01.2027
    costCached2027PerMillionEur: 0.138, // 0.15 $ ab 01.01.2027
    customerInputPerMillionEur: 1.50,
    customerOutputPerMillionEur: 7.50,
    customerCachedPerMillionEur: 0.20,
  },
  {
    modelId: 'gemini-2.5-flash',
    modelName: 'Gemini 2.5 Flash (Mehrsprachige Lokalisierung & Recherche)',
    purpose: 'Standard-Recherche, Monographien & Übersetzungen in 7 Sprachen',
    costInputPerMillionEur: 0.14,       // 0.15 $
    costOutputPerMillionEur: 0.55,      // 0.60 $
    costCachedPerMillionEur: 0.035,     // 0.0375 $
    costInput2027PerMillionEur: 0.14,
    costOutput2027PerMillionEur: 0.55,
    costCached2027PerMillionEur: 0.035,
    customerInputPerMillionEur: 0.50,
    customerOutputPerMillionEur: 2.00,
    customerCachedPerMillionEur: 0.10,
  },
  {
    modelId: 'gemini-2.5-flash-lite',
    modelName: 'Gemini 2.5 Flash-Lite (Sofort-Klassifizierung)',
    purpose: 'Relevanz-Vorprüfung, Symptom-Extraktion & Schnell-Validierung',
    costInputPerMillionEur: 0.09,       // 0.10 $
    costOutputPerMillionEur: 0.37,      // 0.40 $
    costCachedPerMillionEur: 0.023,     // 0.025 $
    costInput2027PerMillionEur: 0.09,
    costOutput2027PerMillionEur: 0.37,
    costCached2027PerMillionEur: 0.023,
    customerInputPerMillionEur: 0.25,
    customerOutputPerMillionEur: 1.00,
    customerCachedPerMillionEur: 0.05,
  },
  {
    modelId: 'gemini-3.1-pro',
    modelName: 'Gemini 3.1 Pro (Flagship Reasoning)',
    purpose: 'Tiefen-Differentialdiagnostik & toxikologische Kreuzanalysen',
    costInputPerMillionEur: 1.84,       // 2.00 $
    costOutputPerMillionEur: 11.04,     // 12.00 $
    costCachedPerMillionEur: 0.184,     // 0.20 $
    costInput2027PerMillionEur: 1.84,
    costOutput2027PerMillionEur: 11.04,
    costCached2027PerMillionEur: 0.184,
    customerInputPerMillionEur: 3.50,
    customerOutputPerMillionEur: 20.00,
    customerCachedPerMillionEur: 0.50,
  },
];

export const DEFAULT_TOKEN_RATES: TokenPricingRates = {
  inputPerMillionEur: 0.69,
  outputPerMillionEur: 3.45,
  cachedPerMillionEur: 0.069,
  currency: '€',
  modelTiers: DEFAULT_MODEL_TIERS
};

export async function fetchTokenBillingSummary(): Promise<TokenBillingSummary> {
  try {
    const res = await fetch('/api/admin/tokens/summary');
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const rates: TokenPricingRates = {
          ...DEFAULT_TOKEN_RATES,
          ...(data.rates || {}),
          modelTiers: (data.rates?.modelTiers && data.rates.modelTiers.length > 0)
            ? data.rates.modelTiers
            : DEFAULT_MODEL_TIERS
        };

        const byTherapist: TherapistTokenSummary[] = (Array.isArray(data.byTherapist) ? data.byTherapist : []).map((t: any) => {
          const promptTokens = Number(t.promptTokens || 0);
          const candidatesTokens = Number(t.candidatesTokens || 0);
          const cachedTokens = Number(t.cachedTokens || 0);
          const totalCostEur = Number(t.totalCostEur || 0);

          // Calculate customer bill based on primary model tier (gemini-3.8-flash) or rates
          const primaryTier = rates.modelTiers?.[0] || DEFAULT_MODEL_TIERS[0];
          const customerPromptCost = (promptTokens / 1000000) * (primaryTier.customerInputPerMillionEur || 1.50);
          const customerCandidatesCost = (candidatesTokens / 1000000) * (primaryTier.customerOutputPerMillionEur || 7.50);
          const customerCachedCost = (cachedTokens / 1000000) * (primaryTier.customerCachedPerMillionEur || 0.20);
          const totalCustomerCostEur = customerPromptCost + customerCandidatesCost + customerCachedCost;

          return {
            ...t,
            promptTokens,
            candidatesTokens,
            cachedTokens,
            totalTokens: Number(t.totalTokens || (promptTokens + candidatesTokens)),
            totalCostEur,
            totalCustomerCostEur: Math.round(totalCustomerCostEur * 10000) / 10000
          };
        });

        const totalPrompt = Number(data.totalPromptTokens ?? data.promptTokens ?? 0);
        const totalCandidates = Number(data.totalCandidatesTokens ?? data.candidatesTokens ?? 0);
        const totalCached = Number(data.totalCachedTokens ?? 0);
        const totalCost = Number(data.totalCostEur ?? data.totalSpentEur ?? 0);
        
        const primaryTier = rates.modelTiers?.[0] || DEFAULT_MODEL_TIERS[0];
        const totalCustomerCostEur = 
          (totalPrompt / 1000000) * (primaryTier.customerInputPerMillionEur || 1.50) +
          (totalCandidates / 1000000) * (primaryTier.customerOutputPerMillionEur || 7.50) +
          (totalCached / 1000000) * (primaryTier.customerCachedPerMillionEur || 0.20);

        return {
          totalPromptTokens: totalPrompt,
          totalCandidatesTokens: totalCandidates,
          totalCachedTokens: totalCached,
          totalTokens: Number(data.totalTokens ?? (totalPrompt + totalCandidates)),
          totalCostEur: totalCost,
          totalCustomerCostEur: Math.round(totalCustomerCostEur * 10000) / 10000,
          totalRequests: Number(data.totalRequests ?? (Array.isArray(data.logs) ? data.logs.length : 0)),
          byTherapist,
          rates,
          lastUpdated: data.lastUpdated || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch token billing summary from server:', err);
  }

  // Fallback empty structure
  return {
    totalPromptTokens: 0,
    totalCandidatesTokens: 0,
    totalCachedTokens: 0,
    totalTokens: 0,
    totalCostEur: 0,
    totalCustomerCostEur: 0,
    totalRequests: 0,
    byTherapist: [],
    rates: DEFAULT_TOKEN_RATES,
    lastUpdated: new Date().toISOString()
  };
}

export async function fetchTokenLogs(therapistId?: string, limit: number = 100): Promise<TokenUsageRecord[]> {
  try {
    const params = new URLSearchParams();
    if (therapistId && therapistId !== 'all') params.append('therapistId', therapistId);
    params.append('limit', limit.toString());

    const res = await fetch(`/api/admin/tokens/logs?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      return data.logs || [];
    } else if (res.status === 403) {
      return [];
    }
  } catch (err) {
    // Suppress network/auth errors in client console
  }
  return [];
}

export async function updateTokenPricingRates(rates: Partial<TokenPricingRates>): Promise<TokenPricingRates> {
  try {
    const res = await fetch('/api/admin/tokens/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rates)
    });
    if (res.ok) {
      const data = await res.json();
      return data.rates || data;
    }
  } catch (err) {
    console.warn('Failed to update token pricing rates:', err);
  }
  return DEFAULT_TOKEN_RATES;
}

export async function resetTokenUsageLogs(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/tokens/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to reset token usage logs:', err);
    return false;
  }
}

/**
 * Format numbers cleanly (e.g. 12,450)
 */
export function formatTokenNumber(num: number): string {
  return new Intl.NumberFormat('de-DE').format(Math.round(num));
}

/**
 * Format currency with high precision (e.g. 0,0842 €)
 */
export function formatTokenCost(costEur: number, currency: string = '€'): string {
  if (costEur === 0) return `0,0000 ${currency}`;
  if (costEur < 0.01) {
    return `${costEur.toFixed(4).replace('.', ',')} ${currency}`;
  }
  return `${costEur.toFixed(3).replace('.', ',')} ${currency}`;
}

/**
 * Generates and downloads a CSV export of the therapist token billing
 */
export function exportTokenBillingCSV(summary: TokenBillingSummary): void {
  const headers = [
    'Therapeut-ID',
    'Name',
    'Praxis',
    'E-Mail',
    'Tarif',
    'Anzahl_Anfragen',
    'Input_Tokens',
    'Output_Tokens',
    'Gesamt_Tokens',
    'Gesamtkosten_EUR',
    'Letzte_Nutzung'
  ];

  const rows = summary.byTherapist.map(t => [
    `"${t.therapistId}"`,
    `"${t.therapistName}"`,
    `"${t.praxisName || ''}"`,
    `"${t.therapistEmail}"`,
    `"${t.tarifLabel || ''}"`,
    t.requestCount,
    t.promptTokens,
    t.candidatesTokens,
    t.totalTokens,
    t.totalCostEur.toFixed(4),
    `"${t.lastUsedAt}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `token_abrechnung_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format single token cost with precision up to 8 decimal places (e.g. 0,00000069 €)
 */
export function formatSingleTokenCost(costEurPerMillion: number, currency: string = '€'): string {
  const perToken = costEurPerMillion / 1000000;
  if (perToken === 0) return `0,00000000 ${currency}`;
  return `${perToken.toFixed(8).replace('.', ',')} ${currency}`;
}

// Aliases for convenience
export const updateTokenRates = updateTokenPricingRates;
export const resetTokenLogs = resetTokenUsageLogs;
export const exportTokenBillingCsv = exportTokenBillingCSV;
export const formatCostEur = formatTokenCost;
export const formatTokenCount = formatTokenNumber;

