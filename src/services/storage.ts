import { Therapist, PatientCase, PackagePlan, LanguageCode, AdminCredentials, SiteConfig, EmailConfig, NameChangeRequest, FollowUpEntry, InitialPrescription, ActiveView, TermsPdfArchiveItem, FreeTrialLimitConfig, TrialLimitMode, TariffPagePermissions, TariffFeatureLimits } from '../types';
import { DEFAULT_TERMS, DEFAULT_TERMS_BY_LANG, getDefaultTermsForLanguage, TermsAndConditions } from '../data/defaultTerms';
import {
  cloudSaveTherapist,
  cloudDeleteTherapist,
  cloudSaveCase,
  cloudDeleteCase,
  cloudDeleteCases,
  cloudSavePackagePlan,
  cloudDeletePackagePlan
} from './cloudSyncService';

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  email: 'p.stogian@yahoo.com',
  password: 'Othonospet@19071963',
  resetEmailDestination: 'p.stogian@yahoo.com',
  securityPin: '360',
};

export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  sendMethod: 'api',
  apiToken: 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf',
  mailboxId: 'ACfb7e2a4063af9612b30d0a193ade',
  smtpHost: 'smtp.hostinger.com',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: 'therapie@homeopilot360.com',
  smtpPassword: 'Othonospet@19071963',
  fromEmail: 'therapie@homeopilot360.com',
  fromName: 'HomeoPilot 360',
  imapHost: 'imap.hostinger.com',
  imapPort: 993,
  imapSecure: true,
  popHost: 'pop.hostinger.com',
  popPort: 995,
  popSecure: true,
};

export const STORAGE_KEYS = {
  THERAPISTS: 'homoeo_saas_therapists_v1',
  ACTIVE_THERAPIST: 'homoeo_saas_active_therapist_id_v1',
  CASES: 'homoeo_saas_cases_v1',
  ADMIN_LOGGED_IN: 'homoeo_saas_admin_auth_v1',
  ADMIN_CREDENTIALS: 'homoeo_saas_admin_credentials_v1',
  PACKAGES: 'homoeo_saas_packages_v1',
  TERMS: 'homoeo_saas_terms_v1',
  SITE_CONFIG: 'homoeo_saas_site_config_v1',
  EMAIL_CONFIG: 'homoeo_saas_email_config_v1',
  REG_TRIAL: 'homoeo_saas_reg_trial_v1',
  FREE_TRIAL_LIMIT: 'homoeo_free_trial_limit_v1',
  NAME_CHANGE_REQUESTS: 'homoeo_name_change_requests',
  TERMS_PDF_ARCHIVE: 'homoeo_saas_terms_pdf_archive_v1',
  ACTIVE_VIEW: 'homoeo_saas_active_view_v1',
  THERAPIST_TAB: 'homoeo_saas_therapist_tab_v1',
  ADMIN_TAB: 'homoeo_saas_admin_tab_v1',
  RECENT_EDITED_PATIENTS: 'homoeo_recent_edited_patients_v1',
};

/**
 * Safe wrapper for localStorage.setItem to guard against QuotaExceededError.
 * In case of storage quota exhaustion, prunes older PDF archives to recover space
 * and dispatches a warning event if storage remains critical.
 */
export function safeLocalStorageSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[Storage] Storage quota or write issue for key "${key}":`, err);
    if (err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014)) {
      try {
        // Attempt emergency cleanup of heavy non-critical PDF archives
        const rawArchive = localStorage.getItem(STORAGE_KEYS.TERMS_PDF_ARCHIVE);
        if (rawArchive) {
          const parsed = JSON.parse(rawArchive);
          if (Array.isArray(parsed) && parsed.length > 2) {
            localStorage.setItem(STORAGE_KEYS.TERMS_PDF_ARCHIVE, JSON.stringify(parsed.slice(0, 2)));
          }
        }
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.error(`[Storage] Fatal quota error while saving "${key}":`, retryErr);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('homoeo_storage_quota_exceeded', { detail: { key } }));
        }
        return false;
      }
    }
    return false;
  }
}

/**
 * Calculates rough storage quota usage and signals warnings if > 85% full.
 */
export function checkStorageQuotaUsage(): { usedBytes: number; quotaEstimate: number; percentage: number; isWarning: boolean } {
  let totalLength = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        const val = localStorage.getItem(k) || '';
        totalLength += (k.length + val.length) * 2; // UTF-16 bytes approx
      }
    }
  } catch {
    // ignore
  }
  const quotaEstimate = 5 * 1024 * 1024; // 5MB standard browser localStorage limit
  const percentage = Math.min(100, Math.round((totalLength / quotaEstimate) * 100));
  return {
    usedBytes: totalLength,
    quotaEstimate,
    percentage,
    isWarning: percentage >= 85,
  };
}

// Registration Trial Management
import { RegistrationTrialConfig, RegistrationTrialTranslations } from '../types';

export const DEFAULT_REG_TRIAL: RegistrationTrialTranslations = {
  de: { badge: 'Kostenloser Test-Tarif', priceDisplay: '0,00 €', description: 'Testen Sie alle Funktionen für bis zu 3 Vollanalysen. Keine Kreditkarte erforderlich.', features: ['3 Vollanalysen & Repertorisation', 'Anamnese & strukturierte Befunde', 'Automatische Sperre nach 3 Analysen'] },
  en: { badge: 'Free Trial', priceDisplay: '€0.00', description: 'Test all features for up to 3 full analyses. No credit card required.', features: ['3 Full Analyses & Repertorization', 'Anamnesis & Structured Findings', 'Automatic lock after 3 analyses'] },
  fr: { badge: 'Essai Gratuit', priceDisplay: '0,00 €', description: 'Testez toutes les fonctionnalités jusqu\'à 3 analyses complètes. Sans carte de crédit.', features: ['3 analyses complètes et répertorisation', 'Anamnèse et résultats structurés', 'Verrouillage automatique après 3 analyses'] },
  el: { badge: 'Δωρεάν Δοκιμή', priceDisplay: '0,00 €', description: 'Δοκιμάστε όλες τις λειτουργίες για έως και 3 πλήρεις αναλύσεις. Δεν απαιτείται πιστωτική κάρτα.', features: ['3 Πλήρεις αναλύσεις & Ρεπερτόριο', 'Αναμνηστικό & Δομημένα Ευρήματα', 'Αυτόματο κλείδωμα μετά από 3 αναλύσεις'] },
  it: { badge: 'Prova Gratuita', priceDisplay: '0,00 €', description: 'Prova tutte le funzionalità fino a 3 analisi complete. Nessuna carta di credito richiesta.', features: ['3 analisi complete e repertorizzazione', 'Anamnesi e risultati strutturati', 'Blocco automatico dopo 3 analisi'] },
  ru: { badge: 'Бесплатная Пробная Версия', priceDisplay: '0,00 €', description: 'Тестируйте все функции до 3 полных анализов. Кредитная карта не требуется.', features: ['3 полных анализа и реперторизация', 'Анамнез и структурированные выводы', 'Автоматическая блокировка после 3 анализов'] },
  es: { badge: 'Prueba Gratuita', priceDisplay: '0,00 €', description: 'Pruebe todas las funciones para hasta 3 análisis completos. No se requiere tarjeta de crédito.', features: ['3 análisis completos y repertorización', 'Anamnesis y hallazgos estructurados', 'Bloqueo automático después de 3 análisis'] }
};

export function getRegistrationTrialTranslations(): RegistrationTrialTranslations {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REG_TRIAL);
    if (!raw) return DEFAULT_REG_TRIAL;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_REG_TRIAL;
  }
}

export function saveRegistrationTrialTranslations(translations: RegistrationTrialTranslations): void {
  safeLocalStorageSetItem(STORAGE_KEYS.REG_TRIAL, JSON.stringify(translations));
  window.dispatchEvent(new Event('homoeo_reg_trial_updated'));
}

export function getLocalizedRegistrationTrial(lang: LanguageCode): RegistrationTrialConfig {
  try {
    const translations = getRegistrationTrialTranslations();
    return translations?.[lang] || translations?.['de'] || DEFAULT_REG_TRIAL[lang] || DEFAULT_REG_TRIAL['de'];
  } catch {
    return DEFAULT_REG_TRIAL[lang] || DEFAULT_REG_TRIAL['de'];
  }
}

// Free Trial Quota Configuration (Analyses, Tokens, or Whichever is First)
export const DEFAULT_FREE_TRIAL_LIMIT: FreeTrialLimitConfig = {
  limitMode: 'both_whichever_first',
  maxAnalyses: 3,
  maxTokens: 25000,
};

export function getFreeTrialLimitConfig(): FreeTrialLimitConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FREE_TRIAL_LIMIT);
    if (!raw) return DEFAULT_FREE_TRIAL_LIMIT;
    return { ...DEFAULT_FREE_TRIAL_LIMIT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FREE_TRIAL_LIMIT;
  }
}

export function saveFreeTrialLimitConfig(config: FreeTrialLimitConfig): void {
  safeLocalStorageSetItem(STORAGE_KEYS.FREE_TRIAL_LIMIT, JSON.stringify(config));
  window.dispatchEvent(new Event('homoeo_trial_limit_updated'));
}

export function checkTherapistLimit(therapist: Therapist): {
  isLocked: boolean;
  reason: 'analyses_reached' | 'tokens_reached' | 'none';
  remainingAnalyses: number;
  remainingTokens: number;
  limitMode: TrialLimitMode;
  maxAnalyses: number;
  maxTokens: number;
  usedAnalyses: number;
  usedTokens: number;
} {
  const isUnlimited = !!therapist.isUnlimited || therapist.tarif === 'pro_unlimited' || therapist.maxAnalyses >= 900000;
  const trialConfig = getFreeTrialLimitConfig();
  const maxAnalyses = therapist.maxAnalyses ?? trialConfig.maxAnalyses ?? 3;
  const maxTokens = therapist.maxTokens ?? trialConfig.maxTokens ?? 25000;
  const usedAnalyses = therapist.usedAnalyses || 0;
  const usedTokens = therapist.usedTokens || 0;

  if (isUnlimited) {
    return {
      isLocked: false,
      reason: 'none',
      remainingAnalyses: 999999,
      remainingTokens: 999999999,
      limitMode: trialConfig.limitMode,
      maxAnalyses,
      maxTokens,
      usedAnalyses,
      usedTokens
    };
  }

  const analysesReached = usedAnalyses >= maxAnalyses;
  const tokensReached = usedTokens >= maxTokens;

  let isLocked = false;
  let reason: 'analyses_reached' | 'tokens_reached' | 'none' = 'none';

  if (trialConfig.limitMode === 'analyses_only') {
    isLocked = analysesReached;
    if (isLocked) reason = 'analyses_reached';
  } else if (trialConfig.limitMode === 'tokens_only') {
    isLocked = tokensReached;
    if (isLocked) reason = 'tokens_reached';
  } else {
    // 'both_whichever_first'
    if (analysesReached || tokensReached) {
      isLocked = true;
      if (analysesReached && !tokensReached) {
        reason = 'analyses_reached';
      } else if (tokensReached && !analysesReached) {
        reason = 'tokens_reached';
      } else {
        reason = 'analyses_reached';
      }
    }
  }

  return {
    isLocked,
    reason,
    remainingAnalyses: Math.max(0, maxAnalyses - usedAnalyses),
    remainingTokens: Math.max(0, maxTokens - usedTokens),
    limitMode: trialConfig.limitMode,
    maxAnalyses,
    maxTokens,
    usedAnalyses,
    usedTokens
  };
}

export function recordTherapistTokenUsage(therapistId: string, tokens: number): void {
  if (!therapistId || !tokens || tokens <= 0) return;
  const current = getTherapists();
  const index = current.findIndex(t => t.id === therapistId);
  if (index === -1) return;

  const therapist = current[index];
  const newUsedTokens = (therapist.usedTokens || 0) + tokens;
  const isUnlimited = !!therapist.isUnlimited || therapist.tarif === 'pro_unlimited' || therapist.maxAnalyses >= 900000;
  
  const updatedTherapist: Therapist = {
    ...therapist,
    usedTokens: newUsedTokens,
  };

  const limitCheck = checkTherapistLimit(updatedTherapist);
  if (!isUnlimited && limitCheck.isLocked) {
    updatedTherapist.status = 'limit_reached';
  }

  current[index] = updatedTherapist;
  saveTherapists(current);
}

// Site Config Management
export function getSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_CONFIG);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function syncSiteConfigFromServer(): Promise<SiteConfig> {
  try {
    const res = await fetch('/api/site/config');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const current = getSiteConfig();
        const merged = { ...current, ...data };
        safeLocalStorageSetItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(merged));
        window.dispatchEvent(new Event('homoeo_site_config_changed'));
        return merged;
      }
    }
  } catch {
    // Ignore network failure, use local
  }
  return getSiteConfig();
}

export function saveSiteConfig(updates: Partial<SiteConfig>): SiteConfig {
  const current = getSiteConfig();
  const updated = { ...current, ...updates };
  safeLocalStorageSetItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(updated));
  window.dispatchEvent(new Event('homoeo_site_config_changed'));

  // Sync to server
  fetch('/api/site/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  }).catch((err) => console.warn('Failed to save site config to server', err));

  return updated;
}

// Admin Credentials Management
export function getAdminCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS);
    if (!raw) {
      safeLocalStorageSetItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
      return DEFAULT_ADMIN_CREDENTIALS;
    }
    const parsed = JSON.parse(raw);
    return {
      email: parsed.email || DEFAULT_ADMIN_CREDENTIALS.email,
      password: parsed.password || DEFAULT_ADMIN_CREDENTIALS.password,
      resetEmailDestination: parsed.resetEmailDestination || DEFAULT_ADMIN_CREDENTIALS.resetEmailDestination,
      securityPin: parsed.securityPin || DEFAULT_ADMIN_CREDENTIALS.securityPin || '360',
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return DEFAULT_ADMIN_CREDENTIALS;
  }
}

export async function syncAdminCredentialsFromServer(): Promise<AdminCredentials> {
  try {
    const res = await fetch('/api/admin/credentials');
    if (res.ok) {
      const data = await res.json();
      if (data && data.password) {
        const serverCreds: AdminCredentials = {
          email: data.email || DEFAULT_ADMIN_CREDENTIALS.email,
          password: data.password || DEFAULT_ADMIN_CREDENTIALS.password,
          resetEmailDestination: data.resetEmailDestination || DEFAULT_ADMIN_CREDENTIALS.resetEmailDestination,
          securityPin: data.securityPin || DEFAULT_ADMIN_CREDENTIALS.securityPin || '360',
          updatedAt: data.updatedAt,
        };
        safeLocalStorageSetItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(serverCreds));
        window.dispatchEvent(new Event('homoeo_admin_credentials_changed'));
        window.dispatchEvent(new Event('homoeo_storage_updated'));
        return serverCreds;
      }
    }
  } catch {
    // Ignore network error in offline mode
  }
  return getAdminCredentials();
}

// Auto-trigger sync on module load in browser (staggered to prevent HTTP/2 frame contention)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncAdminCredentialsFromServer();
    syncSiteConfigFromServer();
    syncEmailConfigFromServer();
  }, 150);
}

// Email Config Management
export function getEmailConfig(): EmailConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_CONFIG);
    if (!raw) {
      safeLocalStorageSetItem(STORAGE_KEYS.EMAIL_CONFIG, JSON.stringify(DEFAULT_EMAIL_CONFIG));
      return DEFAULT_EMAIL_CONFIG;
    }
    const parsed = JSON.parse(raw);
    const sanitizeEmail = (email?: string, fallback?: string) => {
      if (!email) return fallback || '';
      return email.replace('homeopilto360.com', 'homeopilot360.com');
    };

    return {
      sendMethod: parsed.sendMethod || DEFAULT_EMAIL_CONFIG.sendMethod,
      apiToken: parsed.apiToken !== undefined ? parsed.apiToken : DEFAULT_EMAIL_CONFIG.apiToken,
      mailboxId: parsed.mailboxId !== undefined ? parsed.mailboxId : DEFAULT_EMAIL_CONFIG.mailboxId,
      smtpHost: parsed.smtpHost || DEFAULT_EMAIL_CONFIG.smtpHost,
      smtpPort: typeof parsed.smtpPort === 'number' ? parsed.smtpPort : DEFAULT_EMAIL_CONFIG.smtpPort,
      smtpSecure: parsed.smtpSecure !== undefined ? Boolean(parsed.smtpSecure) : DEFAULT_EMAIL_CONFIG.smtpSecure,
      smtpUser: sanitizeEmail(parsed.smtpUser, DEFAULT_EMAIL_CONFIG.smtpUser),
      smtpPassword: parsed.smtpPassword !== undefined ? parsed.smtpPassword : DEFAULT_EMAIL_CONFIG.smtpPassword,
      fromEmail: sanitizeEmail(parsed.fromEmail || parsed.smtpUser, DEFAULT_EMAIL_CONFIG.fromEmail),
      fromName: parsed.fromName || DEFAULT_EMAIL_CONFIG.fromName,
      imapHost: parsed.imapHost || DEFAULT_EMAIL_CONFIG.imapHost,
      imapPort: typeof parsed.imapPort === 'number' ? parsed.imapPort : DEFAULT_EMAIL_CONFIG.imapPort,
      imapSecure: parsed.imapSecure !== undefined ? Boolean(parsed.imapSecure) : DEFAULT_EMAIL_CONFIG.imapSecure,
      popHost: parsed.popHost || DEFAULT_EMAIL_CONFIG.popHost,
      popPort: typeof parsed.popPort === 'number' ? parsed.popPort : DEFAULT_EMAIL_CONFIG.popPort,
      popSecure: parsed.popSecure !== undefined ? Boolean(parsed.popSecure) : DEFAULT_EMAIL_CONFIG.popSecure,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return DEFAULT_EMAIL_CONFIG;
  }
}

export async function syncEmailConfigFromServer(): Promise<EmailConfig> {
  try {
    const res = await fetch('/api/email/config', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.smtpHost) {
        const current = getEmailConfig();
        const merged: EmailConfig = {
          ...current,
          ...data,
        };
        safeLocalStorageSetItem(STORAGE_KEYS.EMAIL_CONFIG, JSON.stringify(merged));
        window.dispatchEvent(new Event('homoeo_email_config_changed'));
        return merged;
      }
    }
  } catch {
    // Ignore network failure, use local
  }
  return getEmailConfig();
}

export function saveEmailConfig(updates: Partial<EmailConfig>): EmailConfig {
  const current = getEmailConfig();
  const updated: EmailConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  safeLocalStorageSetItem(STORAGE_KEYS.EMAIL_CONFIG, JSON.stringify(updated));
  window.dispatchEvent(new Event('homoeo_email_config_changed'));

  // Sync to server
  fetch('/api/email/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  }).catch((err) => console.warn('Failed to save email config to server', err));

  return updated;
}

export function resetEmailConfig(): EmailConfig {
  safeLocalStorageSetItem(STORAGE_KEYS.EMAIL_CONFIG, JSON.stringify(DEFAULT_EMAIL_CONFIG));
  window.dispatchEvent(new Event('homoeo_email_config_changed'));

  // Sync to server
  fetch('/api/email/config/reset', {
    method: 'POST',
  }).catch((err) => console.warn('Failed to reset email config on server', err));

  return DEFAULT_EMAIL_CONFIG;
}

export function saveAdminCredentials(updates: Partial<AdminCredentials>): AdminCredentials {
  const current = getAdminCredentials();
  const updated: AdminCredentials = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  safeLocalStorageSetItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(updated));
  window.dispatchEvent(new Event('homoeo_admin_credentials_changed'));
  window.dispatchEvent(new Event('homoeo_storage_updated'));

  // Sync to server
  fetch('/api/admin/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  }).catch((err) => console.warn('Failed to save admin credentials to server', err));

  return updated;
}

export function resetAdminCredentials(): AdminCredentials {
  safeLocalStorageSetItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
  window.dispatchEvent(new Event('homoeo_admin_credentials_changed'));
  window.dispatchEvent(new Event('homoeo_storage_updated'));

  // Sync to server
  fetch('/api/admin/credentials/reset', {
    method: 'POST',
  }).catch((err) => console.warn('Failed to reset admin credentials on server', err));

  return DEFAULT_ADMIN_CREDENTIALS;
}

// Backward compatibility export proxy
export const ADMIN_CREDENTIALS = new Proxy(DEFAULT_ADMIN_CREDENTIALS, {
  get(target, prop: keyof AdminCredentials) {
    const current = getAdminCredentials();
    return current[prop] !== undefined ? current[prop] : target[prop];
  }
});

export const INITIAL_PACKAGE_PLANS: PackagePlan[] = [
  {
    id: 'free_trial',
    name: 'Kostenloser Test-Tarif',
    price: 0,
    currency: '€',
    billingPeriod: 'free',
    maxAnalyses: 3,
    isUnlimited: false,
    badge: 'Test-Phase',
    description: '3 vollständige Erst- und Folgeanalysen inklusive Repertorisation nach Hahnemann.',
    features: [
      '3 Vollanalysen & Repertorisationen',
      'Anamnese- & Befunddokumentation',
      'Automatische Sperre nach 3 Analysen',
    ],
    isDefault: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    maxVoiceMainComplaintSeconds: 60,
    maxVoiceQuestionAnswerSeconds: 0,
    allowVoiceQuestionAnswer: false,
    pagePermissions: {
      patients: true,
      cases: true,
      quickintake: true,
      materiamedica: true,
      repertorium: false,
      medications: true,
      documentation: true,
    },
    featureLimits: {
      unlimitedAll: false,
      maxPatients: 3,
      maxAnalyses: 3,
      maxMedsPerCase: 3,
      maxRiskAnalyses: 3,
      maxReports: 3,
      maxAiRequests: 5,
    },
  },
  {
    id: 'starter_10',
    name: 'Starter-Paket (10 Analysen)',
    price: 29,
    currency: '€',
    billingPeriod: 'one_time',
    maxAnalyses: 10,
    isUnlimited: false,
    badge: 'Einsteiger',
    description: '10 vollständige Fallanalysen ohne monatliche Bindung oder automatische Verlängerung.',
    features: [
      '10 Vollanalysen & Mittel-Vorschläge',
      'Unbegrenzte Speicherdauer der Fälle',
      'Export als PDF & Fallbericht',
    ],
    isDefault: false,
    isActive: true,
    createdAt: '2025-01-10T00:00:00Z',
    maxVoiceMainComplaintSeconds: 120,
    maxVoiceQuestionAnswerSeconds: 45,
    allowVoiceQuestionAnswer: true,
    pagePermissions: {
      patients: true,
      cases: true,
      quickintake: true,
      materiamedica: true,
      repertorium: true,
      medications: true,
      documentation: true,
    },
    featureLimits: {
      unlimitedAll: false,
      maxPatients: 10,
      maxAnalyses: 10,
      maxMedsPerCase: 8,
      maxRiskAnalyses: 10,
      maxReports: 10,
      maxAiRequests: 25,
    },
  },
  {
    id: 'praxis_50',
    name: 'Praxis-Paket (50 Analysen / Monat)',
    price: 69,
    currency: '€',
    billingPeriod: 'monthly',
    maxAnalyses: 50,
    isUnlimited: false,
    badge: 'Beliebt',
    description: '50 Analysen pro Monat – ideal für etablierte homöopathische Einzelpraxen.',
    features: [
      '50 Analysen jeden Monat inklusive',
      'Prioritäre Repertorisation & Materia Medica',
      'Patienten-Schnellsuche & Sprachnotizen',
    ],
    isDefault: false,
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    maxVoiceMainComplaintSeconds: 180,
    maxVoiceQuestionAnswerSeconds: 60,
    allowVoiceQuestionAnswer: true,
    pagePermissions: {
      patients: true,
      cases: true,
      quickintake: true,
      materiamedica: true,
      repertorium: true,
      medications: true,
      documentation: true,
    },
    featureLimits: {
      unlimitedAll: false,
      maxPatients: 50,
      maxAnalyses: 50,
      maxMedsPerCase: 20,
      maxRiskAnalyses: 50,
      maxReports: 50,
      maxAiRequests: 100,
    },
  },
  {
    id: 'pro_unlimited',
    name: 'Pro Unbegrenzt (Praxis-Flatrate)',
    price: 149,
    currency: '€',
    billingPeriod: 'monthly',
    maxAnalyses: 999999,
    isUnlimited: true,
    badge: 'Flatrate',
    description: 'Unbegrenzte Analysen & Repertorisationen für Großpraxen, Kliniken und Vielnutzer.',
    features: [
      'Unbegrenzte Analysen & Falldokumentationen',
      'Höchste Priorität bei KI-Repertorisation',
      'Vollständige Sprachsteuerung aller Felder',
      'Persönlicher Praxis-Support',
    ],
    isDefault: false,
    isActive: true,
    createdAt: '2025-01-20T00:00:00Z',
    maxVoiceMainComplaintSeconds: 300,
    maxVoiceQuestionAnswerSeconds: 120,
    allowVoiceQuestionAnswer: true,
    pagePermissions: {
      patients: true,
      cases: true,
      quickintake: true,
      materiamedica: true,
      repertorium: true,
      medications: true,
      documentation: true,
    },
    featureLimits: {
      unlimitedAll: true,
      maxPatients: -1,
      maxAnalyses: -1,
      maxMedsPerCase: -1,
      maxRiskAnalyses: -1,
      maxReports: -1,
      maxAiRequests: -1,
    },
  },
];

const INITIAL_THERAPISTS: Therapist[] = [
  {
    id: 'th-101',
    vorname: 'Katharina',
    nachname: 'Lindemann',
    email: 'k.lindemann@naturheilpraxis-berlin.de',
    password: 'homoeo2025!',
    telefon: '+49 30 8472910',
    adresse: 'Schönhauser Allee 45, 10435 Berlin',
    land: 'Deutschland',
    tarif: 'free_trial',
    tarifId: 'free_trial',
    tarifLabel: 'Kostenloser Test-Tarif',
    tarifPrice: 0,
    tarifPeriod: 'free',
    isUnlimited: false,
    usedAnalyses: 0,
    maxAnalyses: 3,
    registeredAt: '2025-02-14T09:30:00Z',
    status: 'active',
    praxisName: 'Naturheilpraxis Lindemann',
    previousEmails: [
      { value: 'k.lindemann.praxis@web.de', changedAt: '2025-02-15T10:00:00Z', note: 'Frühere Registrierungs-Mail' }
    ],
    previousPhones: [
      { value: '+49 30 12345678', changedAt: '2025-02-15T10:00:00Z', note: 'Frühere Festnetznummer' }
    ]
  },
  {
    id: 'th-102',
    vorname: 'Dr. med. Markus',
    nachname: 'Vogel',
    email: 'praxis@dr-vogel-muenchen.de',
    password: 'homoeo2025!',
    telefon: '+49 89 2394812',
    adresse: 'Maximilianstraße 12, 80539 München',
    land: 'Deutschland',
    tarif: 'free_trial',
    tarifId: 'free_trial',
    tarifLabel: 'Kostenloser Test-Tarif',
    tarifPrice: 0,
    tarifPeriod: 'free',
    isUnlimited: false,
    usedAnalyses: 0,
    maxAnalyses: 3,
    registeredAt: '2025-02-18T14:15:00Z',
    status: 'active',
    praxisName: 'Ganzheitliche Medizin Vogel',
  },
  {
    id: 'th-103',
    vorname: 'Sophie',
    nachname: 'Brunner',
    email: 'sophie.brunner@homoeopathie-zuerich.ch',
    password: 'homoeo2025!',
    telefon: '+41 44 280 19 40',
    adresse: 'Bahnhofstrasse 88, 8001 Zürich',
    land: 'Schweiz',
    tarif: 'pro_unlimited',
    tarifId: 'pro_unlimited',
    tarifLabel: 'Pro Unbegrenzt (Praxis-Flatrate)',
    tarifPrice: 149,
    tarifPeriod: 'monthly',
    isUnlimited: true,
    usedAnalyses: 14,
    maxAnalyses: 999999,
    registeredAt: '2025-02-22T11:00:00Z',
    status: 'upgraded',
    praxisName: 'Klassische Homöopathie Zürich',
  },
];

const INITIAL_CASES: PatientCase[] = [
  {
    id: 'case-1',
    therapistId: 'th-101',
    patientName: 'Anna Maria Keller',
    patientAge: 42,
    patientBirthDate: '1983-05-14',
    patientGender: 'weiblich',
    patientHeightCm: 168,
    patientWeightKg: 64,
    patientMaritalStatus: 'verheiratet',
    patientEmail: 'anna.keller@beispiel.de',
    patientPhone: '+49 171 4455667',
    isPregnant: false,
    hasChildren: true,
    childrenCount: 2,
    childrenList: [
      { id: 'c1', name: 'Felix', age: 12, gender: 'männlich' },
      { id: 'c2', name: 'Sophie', age: 8, gender: 'weiblich' },
    ],
    customStammdaten: [
      { id: 'cs-1', name: 'Beruf', value: 'Architektin' },
      { id: 'cs-2', name: 'Hausarzt', value: 'Dr. med. Weber, Berlin' },
      { id: 'cs-3', name: 'Krankenkasse', value: 'TK Techniker Krankenkasse' },
    ],
    anamneseDatum: '2026-08-01',
    hauptbeschwerde: 'Chronische Migräne mit Sehstörungen (Flimmerskotom) rechtsseitig.',
    spontanbericht: 'Schmerzen beginnen am Hinterkopf, ziehen über den Scheitel ins rechte Auge. Häufig nach Stress oder Wetterumschwung (Föhn).',
    modalitaetenBesser: 'Dunkles, ruhiges Zimmer, Druck auf die Schläfe, kalte Umschläge.',
    modalitaetenSchlechter: 'Licht, Lärm, Bücken, Bewegung, Vormittags ab 10:00 Uhr.',
    gemuetPsyche: 'Sehr pflichtbewusst, perfektionistisch, Neigung zur Reizbarkeit bei Schmerzen. Weint nicht gerne vor anderen.',
    koerperAllgemein: 'Verlangen nach salzigen Speisen, starker Durst auf kaltes Wasser, Schlaflosigkeit vor Mitternacht.',
    lokalsymptome: 'Pulsierender, klopfender Schmerz in der rechten Schläfe.',
    bisherigeMittel: 'Triptane (schlechte Verträglichkeit), Ibuprofen 600.',
    nimmtMedikamente: true,
    medikamenteList: [
      { name: 'Ibuprofen 600', dosierung: '1x tgl. bei Bedarf', einnahmeart: 'oral' },
      { name: 'Magnesium 400', dosierung: '1x morgens', einnahmeart: 'oral' },
    ],
    analyzedAt: '2026-08-01T10:15:00Z',
    remedySuggestions: [
      {
        name: 'Natrium muriaticum',
        potency: 'C200',
        score: 94,
        keyIndicators: ['Rechtsseitige Migräne', 'Salzverlangen', 'Verschlimmerung durch Trost', 'Lichtscheu'],
        description: 'Klassisches Mittel für periodische Kopfschmerzen mit Flimmern und starker Stresssensitivität.',
      },
      {
        name: 'Belladonna',
        potency: 'C30',
        score: 82,
        keyIndicators: ['Pulsierender Schmerz', 'Rechte Seite', 'Lichtempfindlichkeit'],
        description: 'Akutmittel bei plötzlich einschießenden, klopfenden Gefäßschmerzen.',
      },
    ],
    clinicalAnalysis: {
      redFlags: {
        warnings: [],
        gesamtbewertung: 'Keine akuten Alarmsymptome. Typischer Verlauf einer chronischen Migräne mit Aura.',
        empfohleneFachrichtung: 'Neurologie (Routine-Kontrolle)',
        dringlichkeit: 'Kein akuter Warnhinweis anhand der vorliegenden Angaben',
      },
      differentialdiagnostik: {
        dringlichkeitHeader: 'Differenzialdiagnostische Abgrenzung',
        items: [
          {
            title: 'Migräne mit Aura vs. Spannungskopfschmerz',
            pro: ['Halbseitig pulsierend', 'Flimmerskotom', 'Lichtscheu'],
            contra: ['Keine dauerhafte Nackensteifigkeit'],
            offeneFragen: ['Häufigkeit der Episoden pro Monat'],
            diagnostik: 'Neurologische Verlaufskontrolle',
          },
        ],
      },
      arztfallEntscheidung: {
        status: 'Nein',
        begruendung: 'Klassische Anamnese einer bereits fachärztlich bekannten Migräne ohne neuartige Red Flags.',
      },
      medikamente: {
        zusammenfassung: 'Bedarfsmedikation mit Ibuprofen bei Schmerzspitzen.',
        details: [
          {
            name: 'Ibuprofen 600',
            wirkstoff: 'Ibuprofen',
            dosierung: 'Bei Bedarf',
            nebenwirkungen: ['Magenreizung möglich'],
            zusammenhaenge: ['Sollte bei homöopathischer Begleitung möglichst reduziert werden'],
          },
        ],
      },
      homoeopathie: {
        summary: 'Natrium muriaticum C200 als tiefgreifendes Konstitutionsmittel indiziert.',
        mittel: [
          {
            name: 'Natrium muriaticum',
            dosierungPotenz: 'C200 einmalig',
            rangBegruendung: 'Exzellente Passung zu Modalitäten (besser Ruhe/Dunkelheit, schlechter 10 Uhr, Verlangen nach Salz).',
            passungSymptome: ['Rechtsseitige Migräne', 'Flimmerskotom', 'Salzhunger'],
            modalitaeten: ['Besser Druck & Kälte', 'Schlechter Licht & Lärm'],
            einnahmehinweis: '3 Globuli einmalig nüchtern auf der Zunge zergehen lassen. 3 Wochen Reaktionsbeobachtung.',
          },
        ],
      },
      gesamtAuswertung: {
        medizinischeEinschaetzung: 'Stabile chronische Migräne ohne akute Gefahrenzeichen.',
        dringlichkeit: 'Routinebehandlung',
        medikamentenBewertung: 'Vertretbar, Schmerzmittelgebrauch im Auge behalten.',
        redFlags: 'Keine vorhanden',
        homoeopathie: 'Natrium muriaticum C200 verordnet.',
        naechsteSchritte: ['Erste Verordnung einnehmen', 'Verlaufskontrolle nach 10 Tagen', 'Schmerztagebuch führen'],
      },
    },
    initialPrescription: {
      remedy: 'Natrium muriaticum',
      potency: 'C200',
      dosage: '3 Globuli einmalig',
      recommendations: 'Verordnung nach der Erstanamnese — bleibt dauerhaft erhalten und wird von Verlaufskontrollen nicht überschrieben.\n3 Globuli sublingual morgens nüchtern. Keine Pfefferminze oder starken ätherischen Öle während der Wirkung.',
      prescribedAt: '2026-08-01T11:00:00Z',
    },
    followUps: [
      {
        id: 'fu-1',
        createdAt: '2026-08-10T21:37:00Z',
        dateDisplay: 'Montag, 10. August 2026, 21:37 Uhr',
        trend: 'Deutlich besser',
        intensityPrevious: 4,
        intensityCurrent: 1,
        befindenVerlauf: 'Keine Migräneanfälle mehr aufgetreten! Fühlt sich deutlich vitaler und gelassener. Vor 3 Tagen trat ein leichter Hautausschlag an den Schläfen auf (mögliche Hering\'sche Hautreaktion).',
        remedyRecommendations: 'Abwarten (keine weitere Gabe solange Besserung anhält). Hautausschlag beobachten, nicht unterdrücken.',
        notes: 'Typische Reaktion nach Gabe von Natrium muriaticum.',
      },
      {
        id: 'fu-2',
        createdAt: '2026-08-24T14:15:00Z',
        dateDisplay: 'Montag, 24. August 2026, 14:15 Uhr',
        trend: 'Deutlich besser',
        intensityPrevious: 2,
        intensityCurrent: 1,
        befindenVerlauf: 'Vollständig beschwerdefrei, auch trotz beruflicher Belastung und Wetterumschwung. Der Hautausschlag ist restlos verschwunden. Patientin ist hochzufrieden.',
        remedyRecommendations: 'Therapieabschluss. Bei erneutem Wiederauftreten Vorstellung zur Kontrollanalyse.',
        notes: 'Sehr erfreulicher Heilungsverlauf.',
      },
    ],
  },
  {
    id: 'case-2',
    therapistId: 'th-101',
    patientName: 'Anna Maria Keller',
    patientAge: 42,
    patientBirthDate: '1983-05-14',
    patientGender: 'weiblich',
    patientHeightCm: 168,
    patientWeightKg: 64,
    patientMaritalStatus: 'verheiratet',
    patientEmail: 'anna.keller@beispiel.de',
    patientPhone: '+49 171 4455667',
    isPregnant: false,
    hasChildren: true,
    childrenCount: 2,
    anamneseDatum: '2026-08-18',
    hauptbeschwerde: 'Akute Lumbalgie (Hexenschuss) nach schwerem Heben im Garten.',
    spontanbericht: 'Stechender Schmerz in der Lendenwirbelsäule beim ersten Aufstehen und Bücken. Besser nach einigen Schritten Bewegung.',
    modalitaetenBesser: 'Fortgesetzte sanfte Bewegung, lokale Wärme, harter Untergrund.',
    modalitaetenSchlechter: 'Erste Bewegung nach Ruhe, nasskaltes Wetter, langes Sitzen.',
    gemuetPsyche: 'Ungeduldig wegen Bewegungseinschränkung.',
    koerperAllgemein: 'Leichte Steifigkeit morgens.',
    lokalsymptome: 'Druckschmerz paraspinal L4/L5.',
    bisherigeMittel: 'Wärmepflaster.',
    analyzedAt: '2026-08-18T16:00:00Z',
    remedySuggestions: [
      {
        name: 'Rhus toxicodendron',
        potency: 'C30',
        score: 91,
        keyIndicators: ['Besser durch fortgesetzte Bewegung', 'Schlechter bei Beginn', 'Verschlimmerung durch Nässe'],
        description: 'Hauptmittel bei Verhebetraumata und Steifigkeit des Bewegungsapparats.',
      },
    ],
    initialPrescription: {
      remedy: 'Rhus toxicodendron',
      potency: 'C30',
      dosage: '3 Globuli 2x täglich für 3 Tage',
      recommendations: 'Verordnung nach der Erstanamnese — bleibt dauerhaft erhalten und wird von Verlaufskontrollen nicht überschrieben.\nIn Wasser auflösen oder direkt sublingual einnehmen.',
      prescribedAt: '2026-08-18T16:30:00Z',
    },
    followUps: [
      {
        id: 'fu-201',
        createdAt: '2026-08-22T10:00:00Z',
        dateDisplay: 'Freitag, 22. August 2026, 10:00 Uhr',
        trend: 'Deutlich besser',
        intensityPrevious: 4,
        intensityCurrent: 1,
        befindenVerlauf: 'LWS wieder frei beweglich. Nur noch minimales Ziehen bei extremem Bücken.',
        remedyRecommendations: 'Mittel absetzen, normale Bewegung fortführen.',
      },
    ],
  },
  {
    id: 'case-3',
    therapistId: 'th-101',
    patientName: 'Michael Berger',
    patientAge: 48,
    patientBirthDate: '1978-03-22',
    patientGender: 'männlich',
    patientHeightCm: 178,
    patientWeightKg: 82,
    patientMaritalStatus: 'verheiratet',
    patientEmail: 'm.berger@consulting.de',
    patientPhone: '+49 160 9988776',
    isPregnant: false,
    hasChildren: true,
    childrenCount: 1,
    childrenList: [
      { id: 'c3', name: 'Leon', age: 16, gender: 'männlich' },
    ],
    customStammdaten: [
      { id: 'cs-4', name: 'Beruf', value: 'Unternehmensberater (60h-Woche)' },
      { id: 'cs-5', name: 'Hausarzt', value: 'Praxis Dr. Schmidt, Berlin' },
    ],
    anamneseDatum: '2026-08-05',
    hauptbeschwerde: 'Krampfartige Magenschmerzen, Sodbrennen und chronische Schlafstörungen.',
    spontanbericht: 'Sehr hohe berufliche Arbeitsbelastung. Wacht jede Nacht um 03:00 Uhr auf und wälzt Probleme. Morgens erschöpft.',
    modalitaetenBesser: 'Wärmflasche auf dem Bauch, feuchte Umschläge, kurzer Mittagsschlaf.',
    modalitaetenSchlechter: 'Morgens beim Aufstehen, Kälte, Kaffee, scharfes Essen, Stress & Ärger.',
    gemuetPsyche: 'Cholerisch, ungeduldig, schnell gereizt bei Verzögerungen, überaus leistungsorientiert.',
    koerperAllgemein: 'Fröstelig, ständiges Verlangen nach Kaffee und Aufputschmitteln, Völlegefühl.',
    lokalsymptome: 'Druckgefühl im Oberbauch 1 Stunde nach Mahlzeiten, krampfartige Obstipation.',
    bisherigeMittel: 'Pantoprazol 20mg.',
    nimmtMedikamente: true,
    medikamenteList: [
      { name: 'Pantoprazol 20mg', dosierung: '1x morgens nüchtern', einnahmeart: 'oral' },
    ],
    analyzedAt: '2026-08-05T15:00:00Z',
    remedySuggestions: [
      {
        name: 'Nux vomica',
        potency: 'C200',
        score: 96,
        keyIndicators: ['Krämpfe nach Stress', 'Erwachen 3 Uhr', 'Gereiztheit', 'Genussmittelüberdruss'],
        description: 'Klassisches Hauptmittel für gestresste, überarbeitete Personen mit Magen-Darm-Beschwerden.',
      },
    ],
    initialPrescription: {
      remedy: 'Nux vomica',
      potency: 'C200',
      dosage: '3 Globuli einmalig',
      recommendations: 'Verordnung nach der Erstanamnese — bleibt dauerhaft erhalten und wird von Verlaufskontrollen nicht überschrieben.\nEinmalige Einnahme abends vor dem Schlafen. Kaffeekonsum nach Möglichkeit reduzieren.',
      prescribedAt: '2026-08-05T15:30:00Z',
    },
    followUps: [
      {
        id: 'fu-301',
        createdAt: '2026-08-20T18:30:00Z',
        dateDisplay: 'Donnerstag, 20. August 2026, 18:30 Uhr',
        trend: 'Leicht gebessert',
        intensityPrevious: 4,
        intensityCurrent: 2,
        befindenVerlauf: 'Schläft deutlich ruhiger, wacht erst gegen 06:00 Uhr auf. Magendrücken nur noch an Tagen mit extremen Meetings. Stimmung ist ausgeglichener.',
        remedyRecommendations: 'Nux vomica C30 bei akutem Wiederauftreten von Stresskrämpfen bereitstellen (max 1x wöchentlich).',
      },
    ],
  },
  {
    id: 'case-4',
    therapistId: 'th-101',
    patientName: 'Lukas Schneider',
    patientAge: 29,
    patientBirthDate: '1997-09-11',
    patientGender: 'männlich',
    patientHeightCm: 182,
    patientWeightKg: 78,
    patientMaritalStatus: 'ledig',
    patientEmail: 'l.schneider@mail.com',
    patientPhone: '+49 152 3344556',
    isPregnant: false,
    hasChildren: false,
    anamneseDatum: '2026-08-28',
    hauptbeschwerde: 'Plötzlich einschießendes hohes Fieber (39.5°C) mit pochenden Kopfschmerzen.',
    spontanbericht: 'Nach kaltem Ostwind plötzlich erkrankt. Gesicht hochrot und heiß, Hände/Füße eher kühl.',
    modalitaetenBesser: 'Absolute Ruhe im Bett, aufrechte Position.',
    modalitaetenSchlechter: 'Geringste Erschütterung, helles Licht, Zugluft, Berührung.',
    gemuetPsyche: 'Verwirrt bei Fieber, schreckhaft, unruhig im Halbschlaf.',
    koerperAllgemein: 'Trockene Hitze, kaum Schweiß, kein Durst trotz hohem Fieber.',
    lokalsymptome: 'Pochende Halsschlagadern, hochroter Rachenring.',
    bisherigeMittel: 'Paracetamol 500mg vor 2 Stunden.',
    analyzedAt: '2026-08-28T18:00:00Z',
    remedySuggestions: [
      {
        name: 'Belladonna',
        potency: 'C30',
        score: 95,
        keyIndicators: ['Plötzlicher Beginn', 'Hochrotes Gesicht', 'Pochende Schmerzen', 'Kein Durst bei Hitze'],
        description: 'Hauptakutmittel bei plötzlichem Beginn mit starker Gefäßüberfüllung und Hitze.',
      },
    ],
    initialPrescription: {
      remedy: 'Belladonna',
      potency: 'C30',
      dosage: '3 Globuli alle 3 Stunden (bis zu 3x)',
      recommendations: 'Verordnung nach der Erstanamnese — bleibt dauerhaft erhalten und wird von Verlaufskontrollen nicht überschrieben.\nBei Schweißausbruch oder Besserung sofort absetzen.',
      prescribedAt: '2026-08-28T18:30:00Z',
    },
  },
];

// Packages & Tariffs
export function getPackagePlans(): PackagePlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (!raw) {
      safeLocalStorageSetItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGE_PLANS));
      return INITIAL_PACKAGE_PLANS;
    }
    const parsed: PackagePlan[] = JSON.parse(raw);
    // Ensure all plans have voice limit settings and permission/quota settings (backward compatibility migration)
    return parsed.map((p) => {
      const isTrial = p.id === 'free_trial' || p.billingPeriod === 'free' || p.price === 0;
      const isUnlimitedPlan = p.isUnlimited || p.id === 'pro_unlimited';
      
      const defaultPermissions = {
        patients: true,
        cases: true,
        quickintake: true,
        materiamedica: true,
        repertorium: isTrial ? false : true,
        medications: true,
        documentation: true,
      };

      const defaultLimits = isUnlimitedPlan ? {
        unlimitedAll: true,
        maxPatients: -1,
        maxAnalyses: -1,
        maxMedsPerCase: -1,
        maxRiskAnalyses: -1,
        maxReports: -1,
        maxAiRequests: -1,
      } : {
        unlimitedAll: false,
        maxPatients: p.maxAnalyses || (isTrial ? 3 : 25),
        maxAnalyses: p.maxAnalyses || (isTrial ? 3 : 25),
        maxMedsPerCase: isTrial ? 3 : 15,
        maxRiskAnalyses: isTrial ? 3 : (p.maxAnalyses || 25),
        maxReports: isTrial ? 3 : (p.maxAnalyses || 25),
        maxAiRequests: isTrial ? 5 : 50,
      };

      return {
        ...p,
        maxVoiceMainComplaintSeconds: p.maxVoiceMainComplaintSeconds !== undefined 
          ? p.maxVoiceMainComplaintSeconds 
          : (isTrial ? 60 : (p.id === 'pro_unlimited' ? 300 : (p.id === 'praxis_50' ? 180 : 120))),
        maxVoiceQuestionAnswerSeconds: p.maxVoiceQuestionAnswerSeconds !== undefined
          ? p.maxVoiceQuestionAnswerSeconds
          : (isTrial ? 0 : (p.id === 'pro_unlimited' ? 120 : (p.id === 'praxis_50' ? 60 : 45))),
        allowVoiceQuestionAnswer: p.allowVoiceQuestionAnswer !== undefined
          ? p.allowVoiceQuestionAnswer
          : !isTrial,
        pagePermissions: p.pagePermissions ? { ...defaultPermissions, ...p.pagePermissions } : defaultPermissions,
        featureLimits: p.featureLimits ? { ...defaultLimits, ...p.featureLimits } : defaultLimits,
      };
    });
  } catch {
    return INITIAL_PACKAGE_PLANS;
  }
}

export function savePackagePlans(plans: PackagePlan[]): void {
  safeLocalStorageSetItem(STORAGE_KEYS.PACKAGES, JSON.stringify(plans));
  window.dispatchEvent(new Event('homoeo_packages_updated'));
  // Sync each plan to Firestore in the background
  for (const p of plans) {
    cloudSavePackagePlan(p);
  }
}

export function createPackagePlan(data: Omit<PackagePlan, 'id' | 'createdAt'>): PackagePlan {
  const current = getPackagePlans();
  const newPlan: PackagePlan = {
    ...data,
    id: 'pkg-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  // If set as default, unset others
  let updatedList = current;
  if (newPlan.isDefault) {
    updatedList = updatedList.map(p => ({ ...p, isDefault: false }));
  }

  const updated = [...updatedList, newPlan];
  savePackagePlans(updated);
  return newPlan;
}

export function updatePackagePlan(id: string, updates: Partial<PackagePlan>): PackagePlan | null {
  const current = getPackagePlans();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return null;

  let updatedList = [...current];
  if (updates.isDefault) {
    updatedList = updatedList.map(p => ({ ...p, isDefault: false }));
  }

  const updatedItem: PackagePlan = {
    ...updatedList[index],
    ...updates,
  };

  updatedList[index] = updatedItem;
  savePackagePlans(updatedList);
  return updatedItem;
}

export function deletePackagePlan(id: string): boolean {
  const current = getPackagePlans();
  if (current.length <= 1) {
    return false; // Prevent deleting the last remaining package
  }
  const filtered = current.filter(p => p.id !== id);
  // If deleted was default, make the first one default
  if (filtered.length > 0 && !filtered.some(p => p.isDefault)) {
    filtered[0].isDefault = true;
  }
  savePackagePlans(filtered);
  cloudDeletePackagePlan(id);
  return true;
}

export function assignPackageToTherapist(therapistId: string, packageId: string, resetUsage: boolean = false): Therapist | null {
  const packages = getPackagePlans();
  const targetPlan = packages.find(p => p.id === packageId) || INITIAL_PACKAGE_PLANS[0];
  
  const currentTherapists = getTherapists();
  const therapist = currentTherapists.find(t => t.id === therapistId);
  if (!therapist) return null;

  const maxAnalyses = targetPlan.isUnlimited ? 999999 : targetPlan.maxAnalyses;
  const usedAnalyses = resetUsage ? 0 : therapist.usedAnalyses;
  
  let newStatus: 'active' | 'limit_reached' | 'upgraded' = 'active';
  if (targetPlan.isUnlimited) {
    newStatus = 'upgraded';
  } else if (usedAnalyses >= maxAnalyses) {
    newStatus = 'limit_reached';
  }

  return updateTherapist(therapistId, {
    tarif: targetPlan.id,
    tarifId: targetPlan.id,
    tarifLabel: targetPlan.name,
    tarifPrice: targetPlan.price,
    tarifPeriod: targetPlan.billingPeriod,
    isUnlimited: targetPlan.isUnlimited,
    maxAnalyses,
    usedAnalyses,
    status: newStatus,
  });
}

export function getTherapists(): Therapist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THERAPISTS);
    if (!raw) {
      safeLocalStorageSetItem(STORAGE_KEYS.THERAPISTS, JSON.stringify(INITIAL_THERAPISTS));
      return INITIAL_THERAPISTS;
    }
    const parsed = JSON.parse(raw);
    let updated = false;
    const sanitized = parsed.map((th: Therapist) => {
      // If a free trial therapist has incorrect or stale 3/3 limit, reset to 0 active
      if (th.tarif === 'free_trial' && th.usedAnalyses >= th.maxAnalyses && th.maxAnalyses <= 3 && (th.id === 'th-101' || th.id === 'th-102')) {
        updated = true;
        return { ...th, usedAnalyses: 0, status: 'active' };
      }
      return th;
    });
    if (updated) {
      safeLocalStorageSetItem(STORAGE_KEYS.THERAPISTS, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return INITIAL_THERAPISTS;
  }
}

export function saveTherapists(therapists: Therapist[]): void {
  safeLocalStorageSetItem(STORAGE_KEYS.THERAPISTS, JSON.stringify(therapists));
  window.dispatchEvent(new Event('homoeo_storage_updated'));
}

export function createTherapist(data: Omit<Therapist, 'id' | 'tarif' | 'tarifLabel' | 'usedAnalyses' | 'maxAnalyses' | 'registeredAt' | 'status'> & { initialPackageId?: string }): Therapist {
  const current = getTherapists();
  const packages = getPackagePlans();
  const initialPlan = (data.initialPackageId && packages.find(p => p.id === data.initialPackageId)) || 
                      packages.find(p => p.isDefault) || 
                      INITIAL_PACKAGE_PLANS[0];

  const maxAnalyses = initialPlan.isUnlimited ? 999999 : initialPlan.maxAnalyses;
  const isPro = initialPlan.isUnlimited;

  const newTherapist: Therapist = {
    vorname: data.vorname,
    nachname: data.nachname,
    praxisName: data.praxisName,
    email: data.email,
    password: data.password || 'homoeo2025!',
    telefon: data.telefon,
    adresse: data.adresse,
    land: data.land,
    preferredLanguage: data.preferredLanguage,
    notes: data.notes,
    id: 'th-' + Date.now(),
    tarif: initialPlan.id,
    tarifId: initialPlan.id,
    tarifLabel: initialPlan.name,
    tarifPrice: initialPlan.price,
    tarifPeriod: initialPlan.billingPeriod,
    isUnlimited: initialPlan.isUnlimited,
    usedAnalyses: 0,
    maxAnalyses,
    registeredAt: new Date().toISOString(),
    status: isPro ? 'upgraded' : 'active',
  };
  
  const updated = [newTherapist, ...current];
  saveTherapists(updated);
  setActiveTherapistId(newTherapist.id);
  cloudSaveTherapist(newTherapist);
  return newTherapist;
}

export function updateTherapist(id: string, updates: Partial<Therapist>): Therapist | null {
  const current = getTherapists();
  const index = current.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  const oldItem = current[index];
  
  // Track previous email if changed and valid
  let updatedPreviousEmails = updates.previousEmails ? [...updates.previousEmails] : (oldItem.previousEmails ? [...oldItem.previousEmails] : []);
  if (updates.email && updates.email.trim().toLowerCase() !== oldItem.email.trim().toLowerCase()) {
    const alreadyLogged = updatedPreviousEmails.some(e => e.value.toLowerCase() === oldItem.email.toLowerCase());
    if (!alreadyLogged && oldItem.email.trim()) {
      updatedPreviousEmails = [
        ...updatedPreviousEmails,
        { value: oldItem.email.trim(), changedAt: new Date().toISOString() }
      ];
    }
  }

  // Track previous phone if changed and valid
  let updatedPreviousPhones = updates.previousPhones ? [...updates.previousPhones] : (oldItem.previousPhones ? [...oldItem.previousPhones] : []);
  if (updates.telefon && updates.telefon.trim() !== oldItem.telefon.trim()) {
    const alreadyLogged = updatedPreviousPhones.some(p => p.value.trim() === oldItem.telefon.trim());
    if (!alreadyLogged && oldItem.telefon.trim()) {
      updatedPreviousPhones = [
        ...updatedPreviousPhones,
        { value: oldItem.telefon.trim(), changedAt: new Date().toISOString() }
      ];
    }
  }

  const updatedItem: Therapist = {
    ...oldItem,
    ...updates,
    previousEmails: updatedPreviousEmails,
    previousPhones: updatedPreviousPhones,
  };
  
  const isUnlimited = updatedItem.isUnlimited || updatedItem.tarif === 'pro_unlimited' || updatedItem.maxAnalyses >= 900000;

  if (isUnlimited) {
    updatedItem.status = 'upgraded';
  } else if (updatedItem.usedAnalyses >= updatedItem.maxAnalyses) {
    updatedItem.status = 'limit_reached';
  } else if (updatedItem.usedAnalyses < updatedItem.maxAnalyses && updatedItem.status === 'limit_reached') {
    updatedItem.status = 'active';
  }

  current[index] = updatedItem;
  saveTherapists(current);
  cloudSaveTherapist(updatedItem);
  return updatedItem;
}

export function deleteTherapist(id: string): void {
  const current = getTherapists().filter(t => t.id !== id);
  saveTherapists(current);
  cloudDeleteTherapist(id);
  
  const activeId = getActiveTherapistId();
  if (activeId === id) {
    if (current.length > 0) {
      setActiveTherapistId(current[0].id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_THERAPIST);
    }
  }
}

export function getActiveTherapistId(): string | null {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_THERAPIST);
  if (stored) return stored;
  return null;
}

export function setActiveTherapistId(id: string): void {
  safeLocalStorageSetItem(STORAGE_KEYS.ACTIVE_THERAPIST, id);
  window.dispatchEvent(new Event('homoeo_active_therapist_changed'));
}

export function getActiveTherapist(): Therapist | null {
  const id = getActiveTherapistId();
  if (!id) return null;
  const list = getTherapists();
  return list.find(t => t.id === id) || null;
}

export interface VoiceRecordingLimits {
  maxMainComplaintSeconds: number;
  maxQuestionAnswerSeconds: number;
  allowQuestionAnswer: boolean;
  tariffName: string;
  tariffId: string;
}

export function getVoiceRecordingLimitsForTherapist(therapistId?: string): VoiceRecordingLimits {
  const currentTherapists = getTherapists();
  const therapist = therapistId 
    ? currentTherapists.find(t => t.id === therapistId) 
    : getActiveTherapist();

  const packages = getPackagePlans();
  const planId = therapist?.tarifId || therapist?.tarif;
  const plan = (planId ? packages.find(p => p.id === planId) : null) 
    || packages.find(p => p.id === 'free_trial') 
    || packages[0];

  const isTrial = !plan || plan.id === 'free_trial' || plan.billingPeriod === 'free' || plan.price === 0;

  const maxMain = plan?.maxVoiceMainComplaintSeconds !== undefined 
    ? plan.maxVoiceMainComplaintSeconds 
    : (isTrial ? 60 : 180);

  const allowQ = plan?.allowVoiceQuestionAnswer !== undefined 
    ? plan.allowVoiceQuestionAnswer 
    : !isTrial;

  const maxQ = !allowQ 
    ? 0 
    : (plan?.maxVoiceQuestionAnswerSeconds !== undefined 
        ? plan.maxVoiceQuestionAnswerSeconds 
        : (isTrial ? 0 : 60));

  return {
    maxMainComplaintSeconds: Math.max(5, maxMain),
    maxQuestionAnswerSeconds: maxQ,
    allowQuestionAnswer: allowQ,
    tariffName: plan?.name || therapist?.tarifLabel || 'Kostenloser Test-Tarif',
    tariffId: plan?.id || 'free_trial',
  };
}

export interface TherapistTariffAccess {
  plan: PackagePlan;
  pagePermissions: Required<TariffPagePermissions>;
  featureLimits: Required<TariffFeatureLimits>;
  isPageAllowed: (pageKey: keyof TariffPagePermissions) => boolean;
  isPageHidden: (pageKey: string) => boolean;
  isUnlimitedAll: boolean;
}

export function getTariffAccessForTherapist(therapistOrId?: Therapist | string): TherapistTariffAccess {
  const currentTherapists = getTherapists();
  const therapist = typeof therapistOrId === 'object' && therapistOrId !== null
    ? therapistOrId
    : (typeof therapistOrId === 'string'
        ? currentTherapists.find(t => t.id === therapistOrId) 
        : getActiveTherapist());

  const packages = getPackagePlans();
  const planId = therapist?.tarifId || therapist?.tarif;
  const plan = (planId ? packages.find(p => p.id === planId) : null) 
    || packages.find(p => p.id === 'free_trial') 
    || packages[0];

  const isUnlimitedPlan = plan?.isUnlimited || plan?.id === 'pro_unlimited' || (therapist?.maxAnalyses ?? 0) >= 900000;
  const isTrial = !plan || plan.id === 'free_trial' || plan.billingPeriod === 'free' || plan.price === 0;

  const rawQuickIntake = plan?.pagePermissions?.quickIntake !== undefined 
    ? plan.pagePermissions.quickIntake 
    : (plan?.pagePermissions?.quickintake !== undefined ? plan.pagePermissions.quickintake : true);

  const rawMateriaMedica = plan?.pagePermissions?.materiaMedica !== undefined 
    ? plan.pagePermissions.materiaMedica 
    : (plan?.pagePermissions?.materiamedica !== undefined ? plan.pagePermissions.materiamedica : true);

  const resolvedPagePermissions: Required<TariffPagePermissions> = {
    dashboard: plan?.pagePermissions?.dashboard !== undefined ? plan.pagePermissions.dashboard : true,
    patients: plan?.pagePermissions?.patients !== undefined ? plan.pagePermissions.patients : true,
    cases: plan?.pagePermissions?.cases !== undefined ? plan.pagePermissions.cases : true,
    quickintake: rawQuickIntake,
    quickIntake: rawQuickIntake,
    materiamedica: rawMateriaMedica,
    materiaMedica: rawMateriaMedica,
    repertorium: plan?.pagePermissions?.repertorium !== undefined ? plan.pagePermissions.repertorium : (isTrial ? false : true),
    medications: plan?.pagePermissions?.medications !== undefined ? plan.pagePermissions.medications : true,
    documentation: plan?.pagePermissions?.documentation !== undefined ? plan.pagePermissions.documentation : true,
    pdfExport: plan?.pagePermissions?.pdfExport !== undefined ? plan.pagePermissions.pdfExport : true,
  };

  const unlimitedAll = plan?.featureLimits?.unlimitedAll ?? isUnlimitedPlan;

  const resolvedFeatureLimits: Required<TariffFeatureLimits> = {
    unlimitedAll,
    maxPatients: unlimitedAll ? -1 : (plan?.featureLimits?.maxPatients ?? (plan?.maxAnalyses || (isTrial ? 3 : 25))),
    unlimitedPatients: unlimitedAll ? true : (plan?.featureLimits?.unlimitedPatients ?? false),
    maxCases: unlimitedAll ? -1 : (plan?.featureLimits?.maxCases ?? plan?.featureLimits?.maxAnalyses ?? (plan?.maxAnalyses || (isTrial ? 3 : 25))),
    unlimitedCases: unlimitedAll ? true : (plan?.featureLimits?.unlimitedCases ?? plan?.featureLimits?.unlimitedAnalyses ?? false),
    maxAnalysesPerCase: unlimitedAll ? -1 : (plan?.featureLimits?.maxAnalysesPerCase ?? 1),
    unlimitedAnalysesPerCase: unlimitedAll ? true : (plan?.featureLimits?.unlimitedAnalysesPerCase ?? false),
    maxMedsPerCase: unlimitedAll ? -1 : (plan?.featureLimits?.maxMedsPerCase ?? (isTrial ? 4 : 15)),
    unlimitedMedsPerCase: unlimitedAll ? true : (plan?.featureLimits?.unlimitedMedsPerCase ?? false),
    maxMedsPerResearch: unlimitedAll ? -1 : (plan?.featureLimits?.maxMedsPerResearch ?? 4),
    unlimitedMedsPerResearch: unlimitedAll ? true : (plan?.featureLimits?.unlimitedMedsPerResearch ?? false),
    maxMedResearch: unlimitedAll ? -1 : (plan?.featureLimits?.maxMedResearch ?? (isTrial ? 3 : 50)),
    unlimitedMedResearch: unlimitedAll ? true : (plan?.featureLimits?.unlimitedMedResearch ?? false),
    maxMateriaMedicaSearch: unlimitedAll ? -1 : (plan?.featureLimits?.maxMateriaMedicaSearch ?? (isTrial ? 3 : 100)),
    unlimitedMateriaMedicaSearch: unlimitedAll ? true : (plan?.featureLimits?.unlimitedMateriaMedicaSearch ?? false),
    maxRepertoriumSearch: unlimitedAll ? -1 : (plan?.featureLimits?.maxRepertoriumSearch ?? (isTrial ? 3 : 100)),
    unlimitedRepertoriumSearch: unlimitedAll ? true : (plan?.featureLimits?.unlimitedRepertoriumSearch ?? false),
    maxRepertoriumSymptoms: unlimitedAll ? -1 : (plan?.featureLimits?.maxRepertoriumSymptoms ?? (isTrial ? 5 : 20)),
    unlimitedRepertoriumSymptoms: unlimitedAll ? true : (plan?.featureLimits?.unlimitedRepertoriumSymptoms ?? false),
    maxQuickIntake: unlimitedAll ? -1 : (plan?.featureLimits?.maxQuickIntake ?? (isTrial ? 3 : 50)),
    unlimitedQuickIntake: unlimitedAll ? true : (plan?.featureLimits?.unlimitedQuickIntake ?? false),
    maxQuickIntakeSymptoms: unlimitedAll ? -1 : (plan?.featureLimits?.maxQuickIntakeSymptoms ?? (isTrial ? 4 : 15)),
    unlimitedQuickIntakeSymptoms: unlimitedAll ? true : (plan?.featureLimits?.unlimitedQuickIntakeSymptoms ?? false),
    maxRiskAnalyses: unlimitedAll ? -1 : (plan?.featureLimits?.maxRiskAnalyses ?? (isTrial ? 3 : (plan?.maxAnalyses || 25))),
    unlimitedRiskAnalyses: unlimitedAll ? true : (plan?.featureLimits?.unlimitedRiskAnalyses ?? false),
    maxReports: unlimitedAll ? -1 : (plan?.featureLimits?.maxReports ?? (isTrial ? 3 : (plan?.maxAnalyses || 25))),
    unlimitedReports: unlimitedAll ? true : (plan?.featureLimits?.unlimitedReports ?? false),
    maxAiRequests: unlimitedAll ? -1 : (plan?.featureLimits?.maxAiRequests ?? (isTrial ? 5 : 50)),
    unlimitedAiRequests: unlimitedAll ? true : (plan?.featureLimits?.unlimitedAiRequests ?? false),
    maxAnalyses: unlimitedAll ? -1 : (plan?.featureLimits?.maxAnalyses ?? plan?.featureLimits?.maxCases ?? (plan?.maxAnalyses || (isTrial ? 3 : 25))),
    unlimitedAnalyses: unlimitedAll ? true : (plan?.featureLimits?.unlimitedAnalyses ?? plan?.featureLimits?.unlimitedCases ?? false),
  };

  return {
    plan,
    pagePermissions: resolvedPagePermissions,
    featureLimits: resolvedFeatureLimits,
    isPageAllowed: (pageKey: keyof TariffPagePermissions) => resolvedPagePermissions[pageKey] !== false,
    isPageHidden: (pageKey: string) => {
      if (!plan?.hiddenPages) return false;
      const normalizedKey = pageKey.toLowerCase();
      for (const k of Object.keys(plan.hiddenPages)) {
        if (k.toLowerCase() === normalizedKey && plan.hiddenPages[k] === true) {
          return true;
        }
      }
      return false;
    },
    isUnlimitedAll: unlimitedAll,
  };
}

export function authenticateTherapist(email: string, password: string): {
  success: boolean;
  therapist?: Therapist;
  error?: 'not_found' | 'invalid_password' | 'missing_fields';
} {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'missing_fields' };
  }

  const therapists = getTherapists();
  const therapist = therapists.find(t => t.email.trim().toLowerCase() === cleanEmail);

  if (!therapist) {
    return { success: false, error: 'not_found' };
  }

  const expectedPassword = therapist.password || 'homoeo2025!';
  if (therapist.password && therapist.password === cleanPassword) {
    setActiveTherapistId(therapist.id);
    return { success: true, therapist };
  } else if (!therapist.password && cleanPassword === 'homoeo2025!') {
    setActiveTherapistId(therapist.id);
    return { success: true, therapist };
  }

  return { success: false, error: 'invalid_password' };
}

export function incrementAnalysesUsed(therapistId: string): { 
  success: boolean; 
  remaining: number; 
  therapist: Therapist | null;
  reason?: 'analyses_reached' | 'tokens_reached';
} {
  const current = getTherapists();
  const index = current.findIndex(t => t.id === therapistId);
  if (index === -1) return { success: false, remaining: 0, therapist: null };
  
  const therapist = current[index];
  const limitCheck = checkTherapistLimit(therapist);

  if (limitCheck.isLocked) {
    return {
      success: false,
      remaining: limitCheck.remainingAnalyses,
      therapist,
      reason: limitCheck.reason !== 'none' ? limitCheck.reason : 'analyses_reached',
    };
  }
  
  const isUnlimited = !!therapist.isUnlimited || therapist.tarif === 'pro_unlimited' || therapist.maxAnalyses >= 900000;
  const newCount = therapist.usedAnalyses + 1;
  const updatedTherapist: Therapist = {
    ...therapist,
    usedAnalyses: newCount,
  };

  const newLimitCheck = checkTherapistLimit(updatedTherapist);
  const newStatus = (!isUnlimited && newLimitCheck.isLocked) ? 'limit_reached' : (isUnlimited ? 'upgraded' : 'active');
  updatedTherapist.status = newStatus;
  
  current[index] = updatedTherapist;
  saveTherapists(current);
  
  const remaining = isUnlimited ? 999999 : newLimitCheck.remainingAnalyses;
  return { success: true, remaining, therapist: updatedTherapist };
}

export function resetTherapistQuota(therapistId: string): Therapist | null {
  return updateTherapist(therapistId, {
    usedAnalyses: 0,
    usedTokens: 0,
    status: 'active',
  });
}

export function resetTherapistFeatureQuota(therapistId: string, actionType?: TherapistUsageActionType | 'all_quotas'): Therapist | null {
  if (!therapistId) return null;
  const actionTypes: TherapistUsageActionType[] = ['med_research', 'materia_search', 'repertorium_search', 'quick_intake', 'risk_analysis', 'reports', 'ai_request'];
  
  if (!actionType || actionType === 'all_quotas') {
    actionTypes.forEach(act => {
      try {
        localStorage.removeItem(`homoeo_usage_${therapistId}_${act}`);
      } catch (e) {}
    });
    return updateTherapist(therapistId, {
      usedAnalyses: 0,
      usedTokens: 0,
      status: 'active',
    });
  } else {
    try {
      localStorage.removeItem(`homoeo_usage_${therapistId}_${actionType}`);
      window.dispatchEvent(new Event('homoeo_storage_updated'));
    } catch (e) {}
    return getTherapists().find(t => t.id === therapistId) || null;
  }
}

export function resetAllTherapistsQuotas(): void {
  const therapists = getTherapists();
  const actionTypes: TherapistUsageActionType[] = ['med_research', 'materia_search', 'repertorium_search', 'quick_intake', 'risk_analysis', 'reports', 'ai_request'];
  
  const updated = therapists.map(th => {
    actionTypes.forEach(act => {
      try {
        localStorage.removeItem(`homoeo_usage_${th.id}_${act}`);
      } catch (e) {}
    });
    return {
      ...th,
      usedAnalyses: 0,
      usedTokens: 0,
      status: (th.tarif === 'pro_unlimited' || th.isUnlimited ? 'upgraded' : 'active') as 'active' | 'limit_reached' | 'locked' | 'upgraded'
    };
  });
  saveTherapists(updated);
}

export function upgradeTherapistToPro(therapistId: string): Therapist | null {
  return assignPackageToTherapist(therapistId, 'pro_unlimited', false);
}

// Cases
export function getRecentlyEditedPatientNames(): { name: string; timestamp: number }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_EDITED_PATIENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPatientEdited(patientName: string): void {
  if (!patientName || !patientName.trim()) return;
  const cleanName = patientName.trim();
  const current = getRecentlyEditedPatientNames().filter(p => p.name.toLowerCase() !== cleanName.toLowerCase());
  current.unshift({ name: cleanName, timestamp: Date.now() });
  safeLocalStorageSetItem(STORAGE_KEYS.RECENT_EDITED_PATIENTS, JSON.stringify(current.slice(0, 25)));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('homoeo_patient_edited', { detail: { patientName: cleanName } }));
  }
}

export function getPatientCases(therapistId?: string): PatientCase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASES);
    let list: PatientCase[] = raw ? JSON.parse(raw) : INITIAL_CASES;
    if (!raw) {
      safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    }
    if (therapistId) {
      list = list.filter(c => c.therapistId === therapistId);
    }
    return list;
  } catch {
    return INITIAL_CASES;
  }
}

export function savePatientCase(caseData: Omit<PatientCase, 'id'> & { id?: string }): PatientCase {
  const all = getPatientCases();
  const id = caseData.id || 'case-' + Date.now();
  const newOrUpdated: PatientCase = {
    ...caseData,
    id,
    updatedAt: caseData.updatedAt || new Date().toISOString(),
  };
  
  const existingIdx = all.findIndex(c => c.id === id);
  if (existingIdx >= 0) {
    all[existingIdx] = newOrUpdated;
  } else {
    all.unshift(newOrUpdated);
  }
  
  safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(all));
  if (newOrUpdated.patientName) {
    recordPatientEdited(newOrUpdated.patientName);
  }
  cloudSaveCase(newOrUpdated);
  window.dispatchEvent(new Event('homoeo_cases_updated'));
  return newOrUpdated;
}

export function deletePatientCase(caseId: string): void {
  const all = getPatientCases().filter(c => c.id !== caseId);
  safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(all));
  cloudDeleteCase(caseId);
  window.dispatchEvent(new Event('homoeo_cases_updated'));
}

export function deletePatientAndAllCases(patientName: string, therapistId?: string): void {
  const cleanName = patientName.trim().toLowerCase();
  const all = getPatientCases();
  const toDeleteIds = all.filter(c => {
    const isSameTherapist = !therapistId || c.therapistId === therapistId;
    return isSameTherapist && (c.patientName || '').trim().toLowerCase() === cleanName;
  }).map(c => c.id);

  const remaining = all.filter(c => {
    const isSameTherapist = !therapistId || c.therapistId === therapistId;
    if (!isSameTherapist) return true;
    return (c.patientName || '').trim().toLowerCase() !== cleanName;
  });
  safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(remaining));

  if (toDeleteIds.length > 0) {
    cloudDeleteCases(toDeleteIds);
  }

  // Also remove from recently edited patients
  try {
    const currentRecent = getRecentlyEditedPatientNames().filter(p => p.name.trim().toLowerCase() !== cleanName);
    safeLocalStorageSetItem(STORAGE_KEYS.RECENT_EDITED_PATIENTS, JSON.stringify(currentRecent));
  } catch {
    // ignore
  }

  window.dispatchEvent(new Event('homoeo_cases_updated'));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('homoeo_patient_edited', { detail: { patientName } }));
  }
}

export function addFollowUpToCase(caseId: string, followUpData: Omit<FollowUpEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): FollowUpEntry | null {
  const all = getPatientCases();
  const caseIdx = all.findIndex(c => c.id === caseId);
  if (caseIdx === -1) return null;

  const newEntry: FollowUpEntry = {
    ...followUpData,
    id: followUpData.id || 'fu-' + Date.now(),
    createdAt: followUpData.createdAt || new Date().toISOString(),
  };

  const existingFollowUps = all[caseIdx].followUps || [];
  all[caseIdx] = {
    ...all[caseIdx],
    followUps: [newEntry, ...existingFollowUps],
  };

  safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(all));
  if (all[caseIdx].patientName) {
    recordPatientEdited(all[caseIdx].patientName);
  }
  window.dispatchEvent(new Event('homoeo_cases_updated'));
  return newEntry;
}

export function updateFollowUpInCase(caseId: string, followUpId: string, updates: Partial<FollowUpEntry>): FollowUpEntry | null {
  const all = getPatientCases();
  const caseIdx = all.findIndex(c => c.id === caseId);
  if (caseIdx === -1) return null;

  const currentCase = all[caseIdx];
  const followUps = currentCase.followUps || [];
  const fuIdx = followUps.findIndex(f => f.id === followUpId);
  if (fuIdx === -1) return null;

  const updatedEntry: FollowUpEntry = {
    ...followUps[fuIdx],
    ...updates,
  };

  const updatedFollowUps = [...followUps];
  updatedFollowUps[fuIdx] = updatedEntry;

  all[caseIdx] = {
    ...currentCase,
    followUps: updatedFollowUps,
  };

  safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(all));
  if (currentCase.patientName) {
    recordPatientEdited(currentCase.patientName);
  }
  window.dispatchEvent(new Event('homoeo_cases_updated'));
  return updatedEntry;
}

export function deleteFollowUpFromCase(caseId: string, followUpId: string): boolean {
  const all = getPatientCases();
  const caseIdx = all.findIndex(c => c.id === caseId);
  if (caseIdx === -1) return false;

  const currentCase = all[caseIdx];
  const followUps = currentCase.followUps || [];
  const filtered = followUps.filter(f => f.id !== followUpId);

  all[caseIdx] = {
    ...currentCase,
    followUps: filtered,
  };

  safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(all));
  window.dispatchEvent(new Event('homoeo_cases_updated'));
  return true;
}

export function updateInitialPrescriptionInCase(caseId: string, prescription: InitialPrescription): boolean {
  const all = getPatientCases();
  const caseIdx = all.findIndex(c => c.id === caseId);
  if (caseIdx === -1) return false;

  all[caseIdx] = {
    ...all[caseIdx],
    initialPrescription: {
      ...prescription,
      prescribedAt: prescription.prescribedAt || new Date().toISOString(),
    },
  };

  safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(all));
  if (all[caseIdx].patientName) {
    recordPatientEdited(all[caseIdx].patientName);
  }
  window.dispatchEvent(new Event('homoeo_cases_updated'));
  return true;
}

export function updatePatientStammdatenAcrossCases(therapistId: string, patientName: string, updates: Partial<PatientCase>): void {
  const all = getPatientCases();
  let modified = false;

  const updatedAll = all.map(c => {
    if (c.therapistId === therapistId && c.patientName.trim().toLowerCase() === patientName.trim().toLowerCase()) {
      modified = true;
      return {
        ...c,
        ...updates,
      };
    }
    return c;
  });

  if (modified) {
    safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(updatedAll));
    recordPatientEdited(patientName);
    window.dispatchEvent(new Event('homoeo_cases_updated'));
  }
}

// Admin Auth State
export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED_IN) === 'true';
}

export function setAdminLoggedIn(loggedIn: boolean): void {
  if (loggedIn) {
    safeLocalStorageSetItem(STORAGE_KEYS.ADMIN_LOGGED_IN, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGGED_IN);
  }
  window.dispatchEvent(new Event('homoeo_admin_auth_changed'));
}

export function resetAllToSampleData(): void {
  safeLocalStorageSetItem(STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGE_PLANS));
  safeLocalStorageSetItem(STORAGE_KEYS.THERAPISTS, JSON.stringify(INITIAL_THERAPISTS));
  safeLocalStorageSetItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
  safeLocalStorageSetItem(STORAGE_KEYS.TERMS, JSON.stringify(DEFAULT_TERMS));
  safeLocalStorageSetItem(STORAGE_KEYS.ACTIVE_THERAPIST, INITIAL_THERAPISTS[0].id);
  safeLocalStorageSetItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
  window.dispatchEvent(new Event('homoeo_packages_updated'));
  window.dispatchEvent(new Event('homoeo_storage_updated'));
  window.dispatchEvent(new Event('homoeo_active_therapist_changed'));
  window.dispatchEvent(new Event('homoeo_cases_updated'));
  window.dispatchEvent(new Event('homoeo_terms_updated'));
  window.dispatchEvent(new Event('homoeo_admin_credentials_changed'));
}

// Terms & Conditions (AGB)
export function getTermsAndConditions(lang: LanguageCode = 'de'): TermsAndConditions {
  try {
    const key = `${STORAGE_KEYS.TERMS}_${lang}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    // Backward compatibility for German stored in base key
    if (lang === 'de') {
      const baseRaw = localStorage.getItem(STORAGE_KEYS.TERMS);
      if (baseRaw) return JSON.parse(baseRaw);
    }
    return getDefaultTermsForLanguage(lang);
  } catch {
    return getDefaultTermsForLanguage(lang);
  }
}

export function saveTermsAndConditions(terms: TermsAndConditions, lang: LanguageCode = 'de'): void {
  const key = `${STORAGE_KEYS.TERMS}_${lang}`;
  safeLocalStorageSetItem(key, JSON.stringify(terms));
  if (lang === 'de') {
    safeLocalStorageSetItem(STORAGE_KEYS.TERMS, JSON.stringify(terms));
  }
  window.dispatchEvent(new Event('homoeo_terms_updated'));
}

export function resetTermsAndConditionsToDefault(lang: LanguageCode = 'de'): TermsAndConditions {
  const defaultVal = getDefaultTermsForLanguage(lang);
  const key = `${STORAGE_KEYS.TERMS}_${lang}`;
  safeLocalStorageSetItem(key, JSON.stringify(defaultVal));
  if (lang === 'de') {
    safeLocalStorageSetItem(STORAGE_KEYS.TERMS, JSON.stringify(defaultVal));
  }
  window.dispatchEvent(new Event('homoeo_terms_updated'));
  return defaultVal;
}

// Terms & Conditions PDF Archive
const ALL_SUPPORTED_LANGS: LanguageCode[] = ['de', 'en', 'es', 'fr', 'it', 'el', 'ru'];

export function getTermsPdfArchive(): TermsPdfArchiveItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TERMS_PDF_ARCHIVE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTermsPdfArchive(items: TermsPdfArchiveItem[]): void {
  safeLocalStorageSetItem(STORAGE_KEYS.TERMS_PDF_ARCHIVE, JSON.stringify(items));
  window.dispatchEvent(new Event('homoeo_terms_pdf_archive_updated'));
  window.dispatchEvent(new Event('homoeo_storage_updated'));
}

export function deleteTermsPdfArchiveItem(id: string): void {
  const current = getTermsPdfArchive();
  const updated = current.filter(item => item.id !== id);
  saveTermsPdfArchive(updated);
}

export function deleteTermsPdfArchiveGroup(versionGroup: string): void {
  const current = getTermsPdfArchive();
  const updated = current.filter(item => item.versionGroup !== versionGroup);
  saveTermsPdfArchive(updated);
}

export function archiveCurrentTermsForAllLanguages(
  customVersion?: string, 
  customLastUpdated?: string
): TermsPdfArchiveItem[] {
  const currentArchive = getTermsPdfArchive();
  const now = new Date();
  const timestamp = now.getTime();
  const versionGroup = `vgroup-${timestamp}`;
  const isoDate = now.toISOString();

  const newItems: TermsPdfArchiveItem[] = ALL_SUPPORTED_LANGS.map(lang => {
    const terms = getTermsAndConditions(lang);
    const version = (customVersion || terms.version || '1.0.0').trim();
    const lastUpdated = (customLastUpdated || terms.lastUpdated || now.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')).trim();
    const content = terms.content || '';
    const sectionCount = (content.match(/^###\s/gm) || []).length;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const cleanVer = version.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pdfFilename = `AGB_v${cleanVer}_${lang.toUpperCase()}_${now.toISOString().split('T')[0]}.pdf`;

    return {
      id: `agb-pdf-${timestamp}-${lang}`,
      versionGroup,
      version,
      title: terms.title || (lang === 'de' ? 'Allgemeine Geschäftsbedingungen' : 'Terms & Conditions'),
      lastUpdated,
      language: lang,
      createdAt: isoDate,
      content,
      wordCount,
      sectionCount,
      pdfFilename
    };
  });

  // Prepend newest first
  const updatedArchive = [...newItems, ...currentArchive];
  saveTermsPdfArchive(updatedArchive);
  return newItems;
}

// Name Change Requests
export function getNameChangeRequests(): NameChangeRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NAME_CHANGE_REQUESTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNameChangeRequests(requests: NameChangeRequest[]): void {
  safeLocalStorageSetItem(STORAGE_KEYS.NAME_CHANGE_REQUESTS, JSON.stringify(requests));
  window.dispatchEvent(new Event('homoeo_name_change_requests_updated'));
}

export function addNameChangeRequest(requestData: Omit<NameChangeRequest, 'id' | 'status' | 'createdAt'>): void {
  const current = getNameChangeRequests();
  const newReq: NameChangeRequest = {
    ...requestData,
    id: 'ncr-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  saveNameChangeRequests([...current, newReq]);
}

export function updateNameChangeRequestStatus(id: string, status: 'approved' | 'rejected'): void {
  const current = getNameChangeRequests();
  const index = current.findIndex(r => r.id === id);
  if (index !== -1) {
    const req = current[index];
    req.status = status;
    req.resolvedAt = new Date().toISOString();
    
    if (status === 'approved') {
      // update therapist
      const therapists = getTherapists();
      const tIndex = therapists.findIndex(t => t.id === req.therapistId);
      if (tIndex !== -1) {
        const therapist = therapists[tIndex];
        const oldNameStr = `${therapist.vorname} ${therapist.nachname}`;
        
        therapist.vorname = req.requestedVorname;
        therapist.nachname = req.requestedNachname;
        
        if (!therapist.previousNames) therapist.previousNames = [];
        therapist.previousNames.push({
          value: oldNameStr,
          changedAt: new Date().toISOString()
        });
        
        saveTherapists(therapists);
      }
    }
    
    saveNameChangeRequests(current);
  }
}

// Navigation & Active View / Tab Persistence
export function getStoredActiveView(): ActiveView {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW) || sessionStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
    if (saved && ['landing', 'register', 'therapist', 'admin'].includes(saved)) {
      return saved as ActiveView;
    }
  } catch (e) {}
  if (getActiveTherapist()) {
    return 'therapist';
  }
  return 'landing';
}

export function setStoredActiveView(view: ActiveView): void {
  try {
    safeLocalStorageSetItem(STORAGE_KEYS.ACTIVE_VIEW, view);
    sessionStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, view);
  } catch (e) {}
}

export function getStoredTherapistTab(): 'cases' | 'patients' | 'materiamedica' | 'quickintake' | 'medications' | 'documentation' | 'profile' | 'tariff' | 'repertorium' {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THERAPIST_TAB) || sessionStorage.getItem(STORAGE_KEYS.THERAPIST_TAB);
    if (saved && ['cases', 'patients', 'materiamedica', 'quickintake', 'medications', 'documentation', 'profile', 'tariff', 'repertorium'].includes(saved)) {
      return saved as any;
    }
  } catch (e) {}
  return 'cases';
}

export function setStoredTherapistTab(tab: string): void {
  try {
    safeLocalStorageSetItem(STORAGE_KEYS.THERAPIST_TAB, tab);
    sessionStorage.setItem(STORAGE_KEYS.THERAPIST_TAB, tab);
  } catch (e) {}
}

export function getStoredAdminTab(): 'therapists' | 'packages' | 'tokens' | 'stripe' | 'terms' | 'config' | 'requests' | 'organon' | 'import_materia_medica' | 'import_repertorium' {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_TAB) || sessionStorage.getItem(STORAGE_KEYS.ADMIN_TAB);
    if (saved && ['therapists', 'packages', 'tokens', 'stripe', 'terms', 'config', 'requests', 'organon', 'import_materia_medica', 'import_repertorium'].includes(saved)) {
      return saved as any;
    }
  } catch (e) {}
  return 'therapists';
}

export function setStoredAdminTab(tab: string): void {
  try {
    safeLocalStorageSetItem(STORAGE_KEYS.ADMIN_TAB, tab);
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_TAB, tab);
  } catch (e) {}
}

export type TherapistUsageActionType = 'med_research' | 'materia_search' | 'repertorium_search' | 'quick_intake' | 'risk_analysis' | 'reports' | 'ai_request';

export function getTherapistUsageCount(therapistId: string, actionType: TherapistUsageActionType): number {
  if (!therapistId) return 0;
  try {
    const key = `homoeo_usage_${therapistId}_${actionType}`;
    const raw = localStorage.getItem(key);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function incrementTherapistUsage(therapistId: string, actionType: TherapistUsageActionType): void {
  if (!therapistId) return;
  try {
    const key = `homoeo_usage_${therapistId}_${actionType}`;
    const current = getTherapistUsageCount(therapistId, actionType);
    localStorage.setItem(key, String(current + 1));
    window.dispatchEvent(new Event('homoeo_storage_updated'));
  } catch (e) {
    console.error(e);
  }
}

export function isFeatureLimitReached(
  therapistId: string,
  feature: 'maxPatients' | 'maxCases' | 'maxAnalysesPerCase' | 'maxMedsPerCase' | 'maxMedsPerResearch' | 'maxMedResearch' | 'maxMateriaMedicaSearch' | 'maxRepertoriumSearch' | 'maxRepertoriumSymptoms' | 'maxQuickIntake' | 'maxQuickIntakeSymptoms' | 'maxRiskAnalyses' | 'maxReports' | 'maxAiRequests',
  additionalCountToTest: number = 0,
  contextId?: string
): { reached: boolean; limit: number; current: number } {
  const access = getTariffAccessForTherapist(therapistId);
  if (access.isUnlimitedAll) {
    return { reached: false, limit: -1, current: 0 };
  }

  const limits = access.featureLimits;
  
  let limitValue = -1;
  let isUnlimited = false;
  let currentUsage = 0;

  switch (feature) {
    case 'maxPatients':
      limitValue = limits.maxPatients ?? -1;
      isUnlimited = !!limits.unlimitedPatients;
      break;
    case 'maxCases':
      limitValue = limits.maxCases ?? -1;
      isUnlimited = !!limits.unlimitedCases;
      break;
    case 'maxAnalysesPerCase':
      limitValue = limits.maxAnalysesPerCase ?? -1;
      isUnlimited = !!limits.unlimitedAnalysesPerCase;
      break;
    case 'maxMedsPerCase':
      limitValue = limits.maxMedsPerCase ?? -1;
      isUnlimited = !!limits.unlimitedMedsPerCase;
      break;
    case 'maxMedsPerResearch':
      limitValue = limits.maxMedsPerResearch ?? -1;
      isUnlimited = !!limits.unlimitedMedsPerResearch;
      break;
    case 'maxMedResearch':
      limitValue = limits.maxMedResearch ?? -1;
      isUnlimited = !!limits.unlimitedMedResearch;
      break;
    case 'maxMateriaMedicaSearch':
      limitValue = limits.maxMateriaMedicaSearch ?? -1;
      isUnlimited = !!limits.unlimitedMateriaMedicaSearch;
      break;
    case 'maxRepertoriumSearch':
      limitValue = limits.maxRepertoriumSearch ?? -1;
      isUnlimited = !!limits.unlimitedRepertoriumSearch;
      break;
    case 'maxRepertoriumSymptoms':
      limitValue = limits.maxRepertoriumSymptoms ?? -1;
      isUnlimited = !!limits.unlimitedRepertoriumSymptoms;
      break;
    case 'maxQuickIntake':
      limitValue = limits.maxQuickIntake ?? -1;
      isUnlimited = !!limits.unlimitedQuickIntake;
      break;
    case 'maxQuickIntakeSymptoms':
      limitValue = limits.maxQuickIntakeSymptoms ?? -1;
      isUnlimited = !!limits.unlimitedQuickIntakeSymptoms;
      break;
    case 'maxRiskAnalyses':
      limitValue = limits.maxRiskAnalyses ?? -1;
      isUnlimited = !!limits.unlimitedRiskAnalyses;
      break;
    case 'maxReports':
      limitValue = limits.maxReports ?? -1;
      isUnlimited = !!limits.unlimitedReports;
      break;
    case 'maxAiRequests':
      limitValue = limits.maxAiRequests ?? -1;
      isUnlimited = !!limits.unlimitedAiRequests;
      break;
  }

  if (isUnlimited || limitValue < 0) {
    return { reached: false, limit: -1, current: 0 };
  }

  if (feature === 'maxPatients') {
    const cases = getPatientCases(therapistId);
    const uniquePatients = new Set(cases.map(c => c.patientName.trim().toLowerCase()));
    currentUsage = uniquePatients.size;
    if (contextId && uniquePatients.has(contextId.trim().toLowerCase())) {
      return { reached: false, limit: limitValue, current: currentUsage };
    }
  } else if (feature === 'maxCases') {
    const cases = getPatientCases(therapistId);
    currentUsage = cases.length;
  } else if (feature === 'maxAnalysesPerCase') {
    if (contextId) {
      const cases = getPatientCases(therapistId);
      const targetCase = cases.find(c => c.id === contextId);
      if (targetCase && (targetCase.remedySuggestions || targetCase.analyzedAt)) {
        currentUsage = 1;
      } else {
        currentUsage = 0;
      }
    } else {
      currentUsage = 0;
    }
  } else if (feature === 'maxMedsPerCase') {
    if (contextId) {
      const cases = getPatientCases(therapistId);
      const targetCase = cases.find(c => c.id === contextId);
      const remedyStr = targetCase?.initialPrescription?.remedy || '';
      currentUsage = remedyStr.split(',').map(r => r.trim()).filter(Boolean).length;
    } else {
      currentUsage = 0;
    }
  } else if (feature === 'maxMedsPerResearch') {
    currentUsage = 0;
  } else if (feature === 'maxRepertoriumSymptoms') {
    currentUsage = 0;
  } else if (feature === 'maxQuickIntakeSymptoms') {
    currentUsage = 0;
  } else {
    if (feature === 'maxQuickIntake') {
      const therapist = getTherapists().find(t => t.id === therapistId);
      currentUsage = therapist ? therapist.usedAnalyses : getTherapistUsageCount(therapistId, 'quick_intake');
    } else {
      const mapActionType: Record<string, TherapistUsageActionType> = {
        maxMedResearch: 'med_research',
        maxMateriaMedicaSearch: 'materia_search',
        maxRepertoriumSearch: 'repertorium_search',
        maxRiskAnalyses: 'risk_analysis',
        maxReports: 'reports',
        maxAiRequests: 'ai_request'
      };
      const action = mapActionType[feature];
      if (action) {
        currentUsage = getTherapistUsageCount(therapistId, action);
      }
    }
  }

  const reached = (currentUsage + additionalCountToTest) > limitValue;
  return { reached, limit: limitValue, current: currentUsage };
}

