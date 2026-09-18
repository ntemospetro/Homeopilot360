import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';

const DATA_DIR = path.join(process.cwd(), 'data');
const STRIPE_CONFIG_FILE = path.join(DATA_DIR, 'stripe_config.json');
const THERAPIST_BALANCES_FILE = path.join(DATA_DIR, 'therapist_balances.json');
const BILLING_PAYMENTS_FILE = path.join(DATA_DIR, 'billing_payments.json');

export interface StoredStripeConfig {
  mode: 'test' | 'live';
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  updatedAt: string;
}

export interface TherapistBalanceRecord {
  therapistId: string;
  balanceEur: number;
  totalDepositedEur: number;
  lowBalanceThreshold: number;
  autoReloadEnabled: boolean;
  autoReloadAmount: number;
  stripeCustomerId?: string;
  lastDepositAt?: string;
  updatedAt: string;
}

export interface BillingPaymentRecord {
  id: string;
  therapistId: string;
  therapistName: string;
  therapistEmail?: string;
  amountEur: number;
  type: 'initial_deposit' | 'manual_reload' | 'auto_reload' | 'package_purchase';
  status: 'succeeded' | 'pending' | 'failed';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  month: string; // YYYY-MM
  note?: string;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

// -------------------------------------------------------------
// 1. STRIPE CLIENT & CONFIGURATION
// -------------------------------------------------------------
let stripeClientInstance: Stripe | null = null;
let currentLoadedSecretKey: string = '';

export function getRawStripeConfig(): StoredStripeConfig {
  ensureDataDir();
  try {
    if (fs.existsSync(STRIPE_CONFIG_FILE)) {
      const raw = fs.readFileSync(STRIPE_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        mode: parsed.mode || 'test',
        publishableKey: parsed.publishableKey || process.env.STRIPE_PUBLISHABLE_KEY || '',
        secretKey: parsed.secretKey || process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: parsed.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '',
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('[Stripe] Could not read stripe_config.json:', err);
  }

  return {
    mode: (process.env.STRIPE_MODE as 'test' | 'live') || 'test',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    updatedAt: new Date().toISOString(),
  };
}

export function saveStripeConfig(updates: Partial<StoredStripeConfig>): StoredStripeConfig {
  ensureDataDir();
  const current = getRawStripeConfig();
  const updated: StoredStripeConfig = {
    mode: updates.mode || current.mode || 'test',
    publishableKey: (updates.publishableKey !== undefined ? updates.publishableKey : current.publishableKey).trim(),
    secretKey: (updates.secretKey !== undefined ? updates.secretKey : current.secretKey).trim(),
    webhookSecret: (updates.webhookSecret !== undefined ? updates.webhookSecret : current.webhookSecret).trim(),
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(STRIPE_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  // Reset stripe client so next call uses updated secret
  stripeClientInstance = null;
  currentLoadedSecretKey = '';
  return updated;
}

export function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  const start = key.substring(0, 7);
  const end = key.substring(key.length - 4);
  return `${start}••••••••${end}`;
}

export function getStripeClient(): Stripe | null {
  const config = getRawStripeConfig();
  if (!config.secretKey) return null;

  if (!stripeClientInstance || currentLoadedSecretKey !== config.secretKey) {
    try {
      stripeClientInstance = new Stripe(config.secretKey, {
        apiVersion: '2025-02-24.acacia' as any,
      });
      currentLoadedSecretKey = config.secretKey;
    } catch (err) {
      console.error('[Stripe] Failed to initialize Stripe client:', err);
      return null;
    }
  }
  return stripeClientInstance;
}

// -------------------------------------------------------------
// 2. THERAPIST BALANCES STORAGE
// -------------------------------------------------------------
const INITIAL_DEMO_BALANCES: TherapistBalanceRecord[] = [
  {
    therapistId: 'th-101',
    balanceEur: 47.85,
    totalDepositedEur: 50.00,
    lowBalanceThreshold: 5.00,
    autoReloadEnabled: false,
    autoReloadAmount: 20.00,
    lastDepositAt: '2026-09-01T10:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    therapistId: 'th-102',
    balanceEur: 3.20,
    totalDepositedEur: 20.00,
    lowBalanceThreshold: 5.00,
    autoReloadEnabled: false,
    autoReloadAmount: 20.00,
    lastDepositAt: '2026-08-15T14:30:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    therapistId: 'th-103',
    balanceEur: 98.40,
    totalDepositedEur: 100.00,
    lowBalanceThreshold: 10.00,
    autoReloadEnabled: true,
    autoReloadAmount: 50.00,
    lastDepositAt: '2026-09-02T08:15:00Z',
    updatedAt: new Date().toISOString()
  }
];

export function getStoredBalances(): Record<string, TherapistBalanceRecord> {
  ensureDataDir();
  try {
    if (fs.existsSync(THERAPIST_BALANCES_FILE)) {
      const raw = fs.readFileSync(THERAPIST_BALANCES_FILE, 'utf-8');
      const list: TherapistBalanceRecord[] = JSON.parse(raw);
      const map: Record<string, TherapistBalanceRecord> = {};
      if (Array.isArray(list)) {
        list.forEach(item => {
          if (item && item.therapistId) map[item.therapistId] = item;
        });
        return map;
      }
    }
  } catch (err) {
    console.warn('[Stripe] Could not read therapist_balances.json:', err);
  }

  // Seed default demo balances
  const map: Record<string, TherapistBalanceRecord> = {};
  INITIAL_DEMO_BALANCES.forEach(item => {
    map[item.therapistId] = item;
  });
  try {
    fs.writeFileSync(THERAPIST_BALANCES_FILE, JSON.stringify(INITIAL_DEMO_BALANCES, null, 2), 'utf-8');
  } catch {}
  return map;
}

export function saveBalances(map: Record<string, TherapistBalanceRecord>): void {
  ensureDataDir();
  const list = Object.values(map);
  fs.writeFileSync(THERAPIST_BALANCES_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

export function getTherapistBalanceRecord(therapistId: string, defaultThreshold: number = 5.00): TherapistBalanceRecord {
  const map = getStoredBalances();
  if (map[therapistId]) {
    return map[therapistId];
  }

  const newRecord: TherapistBalanceRecord = {
    therapistId,
    balanceEur: 20.00, // standard default initial balance
    totalDepositedEur: 20.00,
    lowBalanceThreshold: defaultThreshold || 5.00,
    autoReloadEnabled: false,
    autoReloadAmount: 20.00,
    lastDepositAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  map[therapistId] = newRecord;
  saveBalances(map);
  return newRecord;
}

export function deductUsageFromBalance(therapistId: string, costEur: number): {
  newBalanceEur: number;
  isLowBalance: boolean;
  threshold: number;
} {
  const map = getStoredBalances();
  const record = map[therapistId] || getTherapistBalanceRecord(therapistId);
  record.balanceEur = Math.round((record.balanceEur - Math.max(0, costEur)) * 10000) / 10000;
  record.updatedAt = new Date().toISOString();
  map[therapistId] = record;
  saveBalances(map);

  return {
    newBalanceEur: record.balanceEur,
    isLowBalance: record.balanceEur <= record.lowBalanceThreshold,
    threshold: record.lowBalanceThreshold
  };
}

export function creditDepositToBalance(params: {
  therapistId: string;
  therapistName?: string;
  therapistEmail?: string;
  amountEur: number;
  type: 'initial_deposit' | 'manual_reload' | 'auto_reload' | 'package_purchase';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  note?: string;
}): TherapistBalanceRecord {
  const map = getStoredBalances();
  const record = map[params.therapistId] || getTherapistBalanceRecord(params.therapistId);
  const addAmount = Math.max(0, Number(params.amountEur) || 0);

  record.balanceEur = Math.round((record.balanceEur + addAmount) * 100) / 100;
  record.totalDepositedEur = Math.round((record.totalDepositedEur + addAmount) * 100) / 100;
  record.lastDepositAt = new Date().toISOString();
  record.updatedAt = new Date().toISOString();

  map[params.therapistId] = record;
  saveBalances(map);

  // Record payment in payments log
  addPaymentLog({
    therapistId: params.therapistId,
    therapistName: params.therapistName || params.therapistId,
    therapistEmail: params.therapistEmail,
    amountEur: addAmount,
    type: params.type,
    status: 'succeeded',
    stripeSessionId: params.stripeSessionId,
    stripePaymentIntentId: params.stripePaymentIntentId,
    note: params.note || `Guthaben-Aufladung: +${addAmount.toFixed(2)} €`
  });

  return record;
}

export function updateTherapistBalanceConfig(
  therapistId: string,
  updates: Partial<Pick<TherapistBalanceRecord, 'lowBalanceThreshold' | 'autoReloadEnabled' | 'autoReloadAmount' | 'balanceEur'>>
): TherapistBalanceRecord {
  const map = getStoredBalances();
  const record = map[therapistId] || getTherapistBalanceRecord(therapistId);

  if (updates.lowBalanceThreshold !== undefined) {
    record.lowBalanceThreshold = Math.max(0, Number(updates.lowBalanceThreshold) || 0);
  }
  if (updates.autoReloadEnabled !== undefined) {
    record.autoReloadEnabled = Boolean(updates.autoReloadEnabled);
  }
  if (updates.autoReloadAmount !== undefined) {
    record.autoReloadAmount = Math.max(5, Number(updates.autoReloadAmount) || 20);
  }
  if (updates.balanceEur !== undefined) {
    record.balanceEur = Math.round(Number(updates.balanceEur) * 100) / 100;
  }
  record.updatedAt = new Date().toISOString();
  map[therapistId] = record;
  saveBalances(map);
  return record;
}

// -------------------------------------------------------------
// 3. PAYMENT RECORDS STORAGE
// -------------------------------------------------------------
const INITIAL_DEMO_PAYMENTS: BillingPaymentRecord[] = [
  {
    id: 'pay-seed-1',
    therapistId: 'th-101',
    therapistName: 'Katharina Lindemann',
    therapistEmail: 'k.lindemann@naturheilpraxis-berlin.de',
    amountEur: 50.00,
    type: 'initial_deposit',
    status: 'succeeded',
    stripeSessionId: 'cs_test_initial_th101',
    createdAt: '2026-09-01T10:00:00Z',
    month: '2026-09',
    note: 'Initiales Token-Guthaben Praxis-Paket'
  },
  {
    id: 'pay-seed-2',
    therapistId: 'th-102',
    therapistName: 'Dr. med. Markus Vogel',
    therapistEmail: 'praxis@dr-vogel-muenchen.de',
    amountEur: 20.00,
    type: 'initial_deposit',
    status: 'succeeded',
    stripeSessionId: 'cs_test_initial_th102',
    createdAt: '2026-08-15T14:30:00Z',
    month: '2026-08',
    note: 'Startguthaben-Einzahlung'
  },
  {
    id: 'pay-seed-3',
    therapistId: 'th-103',
    therapistName: 'Sophie Brunner',
    therapistEmail: 'sophie.brunner@homoeopathie-zuerich.ch',
    amountEur: 100.00,
    type: 'initial_deposit',
    status: 'succeeded',
    stripeSessionId: 'cs_test_initial_th103',
    createdAt: '2026-09-02T08:15:00Z',
    month: '2026-09',
    note: 'Premium Start-Guthaben'
  }
];

export function getPaymentLogs(therapistId?: string): BillingPaymentRecord[] {
  ensureDataDir();
  try {
    if (fs.existsSync(BILLING_PAYMENTS_FILE)) {
      const raw = fs.readFileSync(BILLING_PAYMENTS_FILE, 'utf-8');
      const list: BillingPaymentRecord[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        if (therapistId && therapistId !== 'all') {
          return list.filter(p => p.therapistId === therapistId);
        }
        return list;
      }
    }
  } catch (err) {
    console.warn('[Stripe] Could not read billing_payments.json:', err);
  }

  // Seed demo
  try {
    fs.writeFileSync(BILLING_PAYMENTS_FILE, JSON.stringify(INITIAL_DEMO_PAYMENTS, null, 2), 'utf-8');
  } catch {}
  return therapistId && therapistId !== 'all'
    ? INITIAL_DEMO_PAYMENTS.filter(p => p.therapistId === therapistId)
    : INITIAL_DEMO_PAYMENTS;
}

export function addPaymentLog(data: Omit<BillingPaymentRecord, 'id' | 'createdAt' | 'month'>): BillingPaymentRecord {
  ensureDataDir();
  const current = getPaymentLogs();
  const now = new Date();
  const record: BillingPaymentRecord = {
    ...data,
    id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    createdAt: now.toISOString(),
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  };

  current.unshift(record);
  const trimmed = current.slice(0, 1000);
  fs.writeFileSync(BILLING_PAYMENTS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  return record;
}
