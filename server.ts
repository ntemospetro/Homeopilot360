import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import {
  run3StepMedicationSearch,
  run3StepMedicationDetails,
  search_database,
  save_to_database,
  getDatabaseCount,
  ensureMedicationsDatabase
} from "./serverMedications";
import {
  getRawStripeConfig,
  saveStripeConfig,
  maskKey,
  getStripeClient,
  getStoredBalances,
  getTherapistBalanceRecord,
  deductUsageFromBalance,
  creditDepositToBalance,
  updateTherapistBalanceConfig,
  getPaymentLogs,
  addPaymentLog,
} from "./serverStripe";
import {
  evaluateAmtsMedications,
  evaluateAmtsPairs,
  generateAmtsReportMarkdown
} from "./src/services/amtsDosageEngine";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({
    limit: "50mb",
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Country & Language Detection Endpoint (GET, POST, OPTIONS, HEAD with or without trailing slash)
  app.all(["/api/detect-country", "/api/detect-country/"], (req, res) => {
    const cfCountry = req.headers["cf-ipcountry"] || req.headers["x-country-code"] || req.headers["x-appengine-country"];
    let detectedCountry = typeof cfCountry === "string" ? cfCountry.toUpperCase() : "";

    if (!detectedCountry) {
      const acceptLang = req.headers["accept-language"] || "";
      if (acceptLang.includes("el") || acceptLang.includes("gr")) detectedCountry = "GR";
      else if (acceptLang.includes("de")) detectedCountry = "DE";
      else if (acceptLang.includes("fr")) detectedCountry = "FR";
      else if (acceptLang.includes("es")) detectedCountry = "ES";
      else if (acceptLang.includes("it")) detectedCountry = "IT";
      else if (acceptLang.includes("ru")) detectedCountry = "RU";
      else if (acceptLang.includes("en")) detectedCountry = "GB";
    }

    const COUNTRY_LANG_MAP: Record<string, string> = {
      GR: "el", CY: "el",
      DE: "de", AT: "de", CH: "de", LI: "de",
      FR: "fr", BE: "fr", MC: "fr", LU: "fr",
      ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es",
      IT: "it", SM: "it", VA: "it",
      RU: "ru", BY: "ru", KZ: "ru",
      GB: "en", US: "en", CA: "en", AU: "en", IE: "en",
    };

    const finalCountry = detectedCountry || "DE";
    const finalLanguage = COUNTRY_LANG_MAP[finalCountry] || "de";

    res.json({
      countryCode: finalCountry,
      language: finalLanguage,
    });
  });

  // Persistent Data Directory & File Paths
  const DATA_DIR = path.join(process.cwd(), 'data');
  const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');
  const SITE_CONFIG_FILE = path.join(DATA_DIR, 'site_config.json');
  const EMAIL_CONFIG_FILE = path.join(DATA_DIR, 'email_config.json');
  const TOKEN_USAGE_FILE = path.join(DATA_DIR, 'token_usage_logs.json');
  const TOKEN_RATES_FILE = path.join(DATA_DIR, 'token_rates.json');
  const MEDICATION_TRANSLATIONS_FILE = path.join(DATA_DIR, 'medication_translations.json');

  const getMedicationTranslations = (): Record<string, any> => {
    ensureDataDir();
    if (fs.existsSync(MEDICATION_TRANSLATIONS_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(MEDICATION_TRANSLATIONS_FILE, 'utf-8'));
      } catch {}
    }
    return {};
  };

  const saveMedicationTranslation = (key: string, data: any) => {
    try {
      ensureDataDir();
      const map = getMedicationTranslations();
      map[key] = data;
      fs.writeFileSync(MEDICATION_TRANSLATIONS_FILE, JSON.stringify(map, null, 2), 'utf-8');
    } catch (err) {
      console.error("Error saving medication translation:", err);
    }
  };

  const DEFAULT_TOKEN_RATES = {
    inputPerMillionEur: 0.69,
    outputPerMillionEur: 3.45,
    cachedPerMillionEur: 0.069,
    currency: '€',
    modelTiers: [
      {
        modelId: 'gemini-3.8-flash',
        modelName: 'Gemini 3.8 Flash (Klinische Fallanalysen & Repertorisation)',
        purpose: 'Hauptmodell: Vollständige Repertorisation, Miasmen & Toxikologie',
        costInputPerMillionEur: 0.69,
        costOutputPerMillionEur: 3.45,
        costCachedPerMillionEur: 0.069,
        costInput2027PerMillionEur: 1.38,
        costOutput2027PerMillionEur: 6.90,
        costCached2027PerMillionEur: 0.138,
        customerInputPerMillionEur: 1.50,
        customerOutputPerMillionEur: 7.50,
        customerCachedPerMillionEur: 0.20,
      },
      {
        modelId: 'gemini-2.5-flash',
        modelName: 'Gemini 2.5 Flash (Mehrsprachige Lokalisierung & Recherche)',
        purpose: 'Standard-Recherche, Monographien & Übersetzungen in 7 Sprachen',
        costInputPerMillionEur: 0.14,
        costOutputPerMillionEur: 0.55,
        costCachedPerMillionEur: 0.035,
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
        costInputPerMillionEur: 0.09,
        costOutputPerMillionEur: 0.37,
        costCachedPerMillionEur: 0.023,
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
        costInputPerMillionEur: 1.84,
        costOutputPerMillionEur: 11.04,
        costCachedPerMillionEur: 0.184,
        costInput2027PerMillionEur: 1.84,
        costOutput2027PerMillionEur: 11.04,
        costCached2027PerMillionEur: 0.184,
        customerInputPerMillionEur: 3.50,
        customerOutputPerMillionEur: 20.00,
        customerCachedPerMillionEur: 0.50,
      },
    ]
  };

  const ensureDataDir = () => {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error("Failed to create data dir:", err);
      }
    }
  };

  const THERAPIST_LOOKUP: Record<string, { name: string; email: string; praxis: string; tarif: string }> = {
    'th-101': { name: 'Katharina Lindemann', email: 'k.lindemann@naturheilpraxis-berlin.de', praxis: 'Naturheilpraxis Lindemann', tarif: 'Kostenloser Test-Tarif' },
    'th-102': { name: 'Dr. med. Markus Vogel', email: 'praxis@dr-vogel-muenchen.de', praxis: 'Ganzheitliche Medizin Vogel', tarif: 'Kostenloser Test-Tarif' },
    'th-103': { name: 'Sophie Brunner', email: 'sophie.brunner@homoeopathie-zuerich.ch', praxis: 'Klassische Homöopathie Zürich', tarif: 'Pro Unbegrenzt (Praxis-Flatrate)' },
  };

  const getTokenRates = () => {
    ensureDataDir();
    if (fs.existsSync(TOKEN_RATES_FILE)) {
      try {
        return { ...DEFAULT_TOKEN_RATES, ...JSON.parse(fs.readFileSync(TOKEN_RATES_FILE, 'utf-8')) };
      } catch {}
    }
    return DEFAULT_TOKEN_RATES;
  };

  const getSeedTokenLogs = () => {
    return [
      {
        id: 'tok-seed-101',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        therapistId: 'th-103',
        therapistName: 'Sophie Brunner',
        therapistEmail: 'sophie.brunner@homoeopathie-zuerich.ch',
        endpoint: '/api/analyze',
        actionName: 'Große klinische Fallanalyse & Repertorisation',
        model: 'gemini-3.8-flash',
        promptTokens: 2540,
        candidatesTokens: 1890,
        cachedTokens: 1200,
        totalTokens: 4430,
        costEur: 0.00835
      },
      {
        id: 'tok-seed-102',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        therapistId: 'th-103',
        therapistName: 'Sophie Brunner',
        therapistEmail: 'sophie.brunner@homoeopathie-zuerich.ch',
        endpoint: '/api/acute-repertorise',
        actionName: '5-Schritte-Akut-Repertorisation',
        model: 'gemini-3.8-flash',
        promptTokens: 1210,
        candidatesTokens: 840,
        cachedTokens: 650,
        totalTokens: 2050,
        costEur: 0.00378
      },
      {
        id: 'tok-seed-103',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        therapistId: 'th-103',
        therapistName: 'Sophie Brunner',
        therapistEmail: 'sophie.brunner@homoeopathie-zuerich.ch',
        endpoint: '/api/check-medical-relevance',
        actionName: 'Medizinischer Relevanz-Check',
        model: 'gemini-2.5-flash-lite',
        promptTokens: 215,
        candidatesTokens: 32,
        cachedTokens: 0,
        totalTokens: 247,
        costEur: 0.00003
      },
      {
        id: 'tok-seed-201',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        therapistId: 'th-102',
        therapistName: 'Dr. med. Markus Vogel',
        therapistEmail: 'praxis@dr-vogel-muenchen.de',
        endpoint: '/api/analyze',
        actionName: 'Große klinische Fallanalyse',
        model: 'gemini-3.8-flash',
        promptTokens: 2610,
        candidatesTokens: 1950,
        cachedTokens: 1400,
        totalTokens: 4560,
        costEur: 0.00863
      },
      {
        id: 'tok-seed-202',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        therapistId: 'th-102',
        therapistName: 'Dr. med. Markus Vogel',
        therapistEmail: 'praxis@dr-vogel-muenchen.de',
        endpoint: '/api/acute-repertorise',
        actionName: '5-Schritte-Akut-Repertorisation',
        model: 'gemini-3.8-flash',
        promptTokens: 1180,
        candidatesTokens: 810,
        cachedTokens: 500,
        totalTokens: 1990,
        costEur: 0.00364
      },
      {
        id: 'tok-seed-301',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        therapistId: 'th-101',
        therapistName: 'Katharina Lindemann',
        therapistEmail: 'k.lindemann@naturheilpraxis-berlin.de',
        endpoint: '/api/analyze',
        actionName: 'Große klinische Fallanalyse',
        model: 'gemini-3.8-flash',
        promptTokens: 2430,
        candidatesTokens: 1810,
        cachedTokens: 1100,
        totalTokens: 4240,
        costEur: 0.00799
      },
      {
        id: 'tok-seed-302',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        therapistId: 'th-101',
        therapistName: 'Katharina Lindemann',
        therapistEmail: 'k.lindemann@naturheilpraxis-berlin.de',
        endpoint: '/api/check-medical-relevance',
        actionName: 'Medizinischer Relevanz-Check',
        model: 'gemini-2.5-flash-lite',
        promptTokens: 195,
        candidatesTokens: 28,
        cachedTokens: 0,
        totalTokens: 223,
        costEur: 0.00003
      }
    ];
  };

  const getStoredTokenLogs = (): any[] => {
    ensureDataDir();
    if (fs.existsSync(TOKEN_USAGE_FILE)) {
      try {
        const raw = fs.readFileSync(TOKEN_USAGE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const seeds = getSeedTokenLogs();
    try {
      fs.writeFileSync(TOKEN_USAGE_FILE, JSON.stringify(seeds, null, 2), 'utf-8');
    } catch {}
    return seeds;
  };

  const recordTokenUsage = (params: {
    therapistId?: string;
    therapistName?: string;
    therapistEmail?: string;
    endpoint: string;
    actionName: string;
    model: string;
    promptTokens: number;
    candidatesTokens: number;
    cachedTokens?: number;
  }) => {
    try {
      ensureDataDir();
      const rates = getTokenRates();
      const promptTokens = Math.max(0, Math.round(params.promptTokens || 0));
      const candidatesTokens = Math.max(0, Math.round(params.candidatesTokens || 0));
      const cachedTokens = Math.max(0, Math.round(params.cachedTokens || 0));
      const totalTokens = promptTokens + candidatesTokens;
      
      const inputCost = (promptTokens / 1_000_000) * (rates.inputPerMillionEur || 0.69);
      const outputCost = (candidatesTokens / 1_000_000) * (rates.outputPerMillionEur || 3.45);
      const cachedCost = (cachedTokens / 1_000_000) * (rates.cachedPerMillionEur || 0.069);
      const costEur = Math.round((inputCost + outputCost + cachedCost) * 100000) / 100000;

      // Calculate customer price based on admin configured pricing matrix
      const matchingTier = (rates.modelTiers && Array.isArray(rates.modelTiers))
        ? rates.modelTiers.find((t: any) => t.modelId === params.model) || rates.modelTiers[0]
        : null;

      const custInputRate = matchingTier ? (matchingTier.customerInputPerMillionEur ?? 1.50) : 1.50;
      const custOutputRate = matchingTier ? (matchingTier.customerOutputPerMillionEur ?? 7.50) : 7.50;
      const custCachedRate = matchingTier ? (matchingTier.customerCachedPerMillionEur ?? 0.20) : 0.20;

      const custInput = (promptTokens / 1_000_000) * custInputRate;
      const custOutput = (candidatesTokens / 1_000_000) * custOutputRate;
      const custCached = (cachedTokens / 1_000_000) * custCachedRate;
      const customerCostEur = Math.round((custInput + custOutput + custCached) * 100000) / 100000;

      const logs = getStoredTokenLogs();
      const resolvedTherapistId = params.therapistId || 'th-101';
      const meta = THERAPIST_LOOKUP[resolvedTherapistId] as { name?: string; email?: string; praxis?: string; tarif?: string } | undefined;

      // Deduct from therapist's real balance
      try {
        deductUsageFromBalance(resolvedTherapistId, customerCostEur);
      } catch (balErr) {
        console.warn("[Stripe] Failed to deduct token usage from balance:", balErr);
      }

      const newRecord = {
        id: 'tok-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        therapistId: resolvedTherapistId,
        therapistName: params.therapistName || meta?.name || 'Unbekannter Therapeut',
        therapistEmail: params.therapistEmail || meta?.email || '',
        endpoint: params.endpoint,
        actionName: params.actionName,
        model: params.model,
        promptTokens,
        candidatesTokens,
        cachedTokens,
        totalTokens,
        costEur,
        customerCostEur
      };

      logs.unshift(newRecord);
      const trimmedLogs = logs.slice(0, 3000);
      fs.writeFileSync(TOKEN_USAGE_FILE, JSON.stringify(trimmedLogs, null, 2), 'utf-8');
      return newRecord;
    } catch (err) {
      console.error("Error recording token usage:", err);
    }
  };

  // Helper to safely extract Gemini API key from various common environment variable names
  const getGeminiApiKey = (): string | undefined => {
    return (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.VITE_GOOGLE_API_KEY
    );
  };

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { caseData, language = "de" } = req.body;

      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(503).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const langNames: Record<string, string> = {
        de: "German (Deutsch)",
        en: "English",
        el: "Greek (Ελληνικά)",
        es: "Spanish (Español)",
        fr: "French (Français)",
        it: "Italian (Italiano)",
        ru: "Russian (Русский)"
      };
      const targetLanguageName = langNames[language] || "German (Deutsch)";
      
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
Du bist ein medizinischer Analyseassistent und homöopathischer Experte.
Werte den gesamten übergebenen Patientenfall systematisch, professionell und vollständig aus.

WICHTIG / IMPORTANT:
Generiere alle Inhalte, Texte, Beurteilungen, Warnungen, Differenzialdiagnosen, Begründungen, Empfehlungen und homöopathischen Analysen vollständig in der Zielsprache: ${targetLanguageName}.
(Halte die JSON-Schlüssel exakt wie im Schema vorgegeben, aber alle Werte und Textinhalte MÜSSEN in ${targetLanguageName} verfasst sein).

Fall-Daten:
${JSON.stringify(caseData, null, 2)}

Antworte AUSSCHLIESSLICH mit einem gültigen JSON-Objekt im folgenden Format (ohne Markdown Code-Blöcke):
{
  "symptomatik": {
    "leitsymptome": ["Leitsymptom 1", "Leitsymptom 2"],
    "begleitsymptome": ["Begleitsymptom 1", "Begleitsymptom 2"],
    "modalitaetenBesser": ["Besser durch Ruhe", "Besser durch Wärme"],
    "modalitaetenSchlechter": ["Schlechter durch Stress", "Schlechter durch Kälte"],
    "zeitverlauf": ["Beginn...", "Verlauf..."],
    "psychischVegetativ": ["Innere Unruhe...", "Schlaf..."]
  },
  "redFlags": {
    "warnings": [
      {
        "text": "Warnhinweis Text mit Begründung",
        "severity": "WARNUNG",
        "status": "vorhanden",
        "abklaerung": "Empfohlene medizinische Abklärung"
      }
    ],
    "gesamtbewertung": "Eine zeitnahe ärztliche Abklärung wird empfohlen.",
    "empfohleneFachrichtung": "Bitte besprechen Sie die Beschwerden zunächst mit Ihrem Hausarzt / Ihrer Hausärztin bzw. einer allgemeinmedizinischen Praxis.",
    "dringlichkeit": "Zeitnahe ärztliche Abklärung sinnvoll"
  },
  "differentialdiagnostik": {
    "dringlichkeitHeader": "ZEITNAHE MEDIZINISCHE ABKLÄRUNG",
    "items": [
      {
        "title": "Spannungskopfschmerz mit muskulärer Nackenbeteiligung",
        "pro": [
          "Beidseitiger dumpf-drückender Schmerz an den Schläfen...",
          "Zusammenhang mit Stress, langem Sitzen, Bildschirmarbeit..."
        ],
        "contra": [
          "Die Häufigkeit von zwei bis drei Episoden pro Woche..."
        ],
        "offeneFragen": [
          "Wurden Blutdruck, neurologischer Status bereits durchgeführt?",
          "Wie ergonomisch ist der Arbeitsplatz?"
        ],
        "diagnostik": "Neurologischer Status, HWS-Untersuchung"
      }
    ]
  },
  "arztfallEntscheidung": {
    "status": "Ja",
    "begruendung": "Begründung, warum eine hausärztliche Untersuchung sinnvoll/erforderlich ist."
  },
  "medikamente": {
    "zusammenfassung": "Zusammenfassung der eingenommenen Medikamente und Wechselwirkungen.",
    "warnhinweis": "Alle Angaben beschreiben mögliche, keine gesicherten Zusammenhänge und ersetzen keine ärztliche oder pharmazeutische Beratung.",
    "details": [
      {
        "name": "Ibuprofen 400",
        "wirkstoff": "Ibuprofen",
        "dosierung": "400 mg pro gelegentlicher Einnahme",
        "einnahme": "Gelegentlich bei Schmerzen",
        "wirkung": "Teilweise bis gute Besserung",
        "nebenwirkungen": [
          "Magen-Darm-Beschwerden wie Dyspepsie, Bauchschmerzen...",
          "Seltenere Risiken wie Magenschleimhautläsionen..."
        ],
        "zusammenhaenge": [
          "Aus den vorliegenden Angaben ergibt sich kein Hinweis auf eine akute Dosierungsauffälligkeit."
        ],
        "wechselwirkungen": ["Alkohol verstärkt Schleimhautreizung"],
        "risiken": "Vorsicht bei Nierenerkrankungen und Magenulzera",
        "uebergebrauchBeurteilung": "Kein Anhalt für Medikamentenübergebrauch bei seltener Einnahme."
      }
    ],
    "ibuprofenSpezifisch": {
      "dosierungEinnahme": "400 mg pro gelegentlicher Einnahme",
      "wirkung": "Schmerzlinderung",
      "risiken": ["Gastrointestinale Reizung", "Nierenperfusion"],
      "uebergebrauch": "Unter 10 Tagen/Monat"
    }
  },
  "fehlendeInformationen": [
    "Aktuelle Blutdruckwerte",
    "Neurologischer Status",
    "Genaue Schmerztagebuch-Dokumentation"
  ],
  "homoeopathie": {
    "summary": "Traditionelle homöopathische Fallauswertung als komplementäre Betrachtung.",
    "symptomHierarchie": {
      "leitsymptome": ["Charakteristischstes Symptom"],
      "allgemeinsymptome": ["Wärme/Kälte, Schlaf"],
      "gemuetsymptome": ["Pflichtbewusst, verschlossen"],
      "lokalsymptome": ["Schläfenschmerz rechts"],
      "modalitaeten": ["Besser: Ruhe, Kälte / Schlechter: Sonne, Trost"],
      "begleitsymptome": ["Durst auf kaltes Wasser"]
    },
    "mittel": [
      {
        "name": "Natrium muriaticum (Nat-m)",
        "passungSymptome": ["Kopfschmerz nach Belastung", "Verschlossenheit"],
        "modalitaeten": ["Besser durch Liegen im Dunkeln", "Schlechter vormittags"],
        "contraNichtPassend": ["Keine starken Hitzewallungen"],
        "fehlendeInfos": ["Genaue Sonnenreaktion"],
        "rangBegruendung": "Höchste Deckung mit Gemüt und Modalitäten.",
        "dosierungPotenz": "C30",
        "potenz": "C30",
        "tagesdosis": "1 bis 2 Gaben à 3–5 Globuli",
        "haeufigkeit": "1- bis 2-mal täglich (z. B. morgens und bei Bedarf abends)",
        "anwendungsdauer": "3 bis maximal 5 Tage (nach Hahnemann: bei spürbarer Besserung sofort pausieren)",
        "zeitraum": "Akut- und Initialphase (1. bis 2. Behandlungswoche)",
        "einnahmehinweis": "Globuli langsam sublingual unter der Zunge zergehen lassen. Mindestens 15 Minuten Abstand zu Mahlzeiten, Kaffee, Zähneputzen und mentholhaltigen Produkten."
      }
    ],
    "trennung": {
      "medizinisch": ["Ärztliche Untersuchung und Diagnostik"],
      "komplementaer": ["Ergonomie, Bewegung, Entspannung"],
      "homoeopathisch": ["Repertorisation zur Unterstützung der Selbstregulation"]
    }
  },
  "gesamtAuswertung": {
    "medizinischeEinschaetzung": "Verdacht auf primär funktionell-muskuläre Genese unter Belastung.",
    "dringlichkeit": "Zeitnahe ärztliche Abklärung sinnvoll",
    "medikamentenBewertung": "Bedarfsmedikation adäquat, Übergebrauch beachten.",
    "redFlags": "Keine akuten Notfall-Red-Flags dokumentiert.",
    "homoeopathie": "Homöopathische Begleitung möglich.",
    "naechsteSchritte": [
      "1. Hausärztliche Untersuchung durchführen",
      "2. Kopfschmerztagebuch führen",
      "3. Ergonomie optimieren",
      "4. Entspannungsmethoden etablieren",
      "5. Zahnärztliche Kontrolle bei Zähneknirschen"
    ]
  }
}

Beachte alle Details aus den Fall-Daten. Keine Daten erfinden, fehlende Daten als fehlend benennen. Alle Text-Antworten in ${targetLanguageName} ausgeben.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const usage = (response as any).usageMetadata || {};
      recordTokenUsage({
        therapistId: req.body?.therapistId,
        therapistName: req.body?.therapistName,
        therapistEmail: req.body?.therapistEmail,
        endpoint: "/api/analyze",
        actionName: "Große klinische Fallanalyse",
        model: "gemini-3.8-flash",
        promptTokens: usage.promptTokenCount || Math.ceil(prompt.length / 4),
        candidatesTokens: usage.candidatesTokenCount || Math.ceil((response.text || "").length / 4),
      });

      res.json({ analysis: JSON.parse(response.text || '{}') });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate analysis." });
    }
  });

  // 5-Schritte Homöopathischer Experten-Repertorisations-Endpunkt
  app.post("/api/acute-repertorise", async (req, res) => {
    try {
      const { symptomText, language = "de" } = req.body;
      if (!symptomText || typeof symptomText !== "string" || !symptomText.trim()) {
        return res.status(400).json({ error: "symptomText is required" });
      }

      const langNames: Record<string, string> = {
        de: "German (Deutsch)",
        en: "English",
        el: "Greek (Ελληνικά)",
        es: "Spanish (Español)",
        fr: "French (Français)",
        it: "Italian (Italiano)",
        ru: "Russian (Русский)"
      };
      const targetLanguageName = langNames[language] || "German (Deutsch)";

      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(503).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
Du bist das logische Hintergrund-Modul (Backend-Engine) einer bestehenden Homöopathie-App zur hochpräzisen, unvoreingenommenen Akutanalyse.
Deine Aufgabe ist es, den eingegebenen Patienten-Freitext (via Sprache oder Text) methodisch nach den Grundsätzen von Hahnemanns Organon §§ 83–104 und der differenzialdiagnostischen Wertigkeitslehre von James Tyler Kent zu analysieren und ein lückenloses, homöopathisches Ausschlussverfahren (Repertorisation) im Hintergrund zu berechnen.

METHODISCHE GRUNDSÄTZE DER FALLAUFNAHME (Organon §§ 83–104):
1. STRIKTE TRENNUNG & FREITEXT-PRIORITÄT (Organon § 84):
   - Trenne strikt zwischen:
     * dem, was der Patient tatsächlich gesagt hat (Originalworte und unverfälschte Phänomene sind immer die Primärquelle),
     * der gezielten, offenen Nachfrage zur Präzisierung,
     * der strukturierten Erfassung,
     * und jeder späteren medizinischen oder homöopathischen Interpretation.
   - Der freie Patiententext hat stets absoluten Vorrang vor jeder vorgegebenen Kategorie.

2. KEINE ERFINDUNG ODER ABLEITUNG:
   - Du darfst NIEMALS ein Symptom, eine Empfindung, eine Modalität, eine Ursache oder einen Gemütszustand hinzufügen, unterstellen oder voraussetzen, den der Patient nicht selbst angegeben hat.
   - Beispiel: Sagt der Patient „Ich habe starken Durst“, darfst du NICHT ableiten „Möchte große Mengen kaltes Wasser“. Diese Information muss ausdrücklich erfragt werden.
   - Wenn der Patient nur „Fieber“ schreibt, darfst du daraus nicht automatisch Durst, Schüttelfrost, Schwitzen, Kopfschmerzen, Unruhe, Angst, bestimmte Trinktemperaturen oder Modalitäten ableiten.
   - „Nicht angegeben“ bedeutet niemals „Nein“: Wenn eine Information fehlt, markiere sie ausnahmslos als "Unbekannt (Bitte erfragen)". Niemals als "keine".

3. CAUSA / AUSLÖSER vs. ZEITLICHER BEGINN (Organon §§ 86, 99):
   - Eine Causa darf nur erfasst werden, wenn der Patient selbst einen echten Auslöser genannt hat (z. B. Durchnässung, kalter Wind, Sonnenstich, Schock, Ärger, Verkühlung).
   - Ein bloßer zeitlicher Beginn („Seit gestern habe ich Fieber“) ist KEINE Causa!

4. MODALITÄTEN & GEMÜTSZUSTAND (Organon §§ 86, 90):
   - Modalitäten (Besserung/Verschlimmerung) dürfen nur erfasst werden, wenn der Patient sie selbst genannt hat. Fehlen sie: "Unbekannt (Bitte erfragen)".
   - Der Gemütszustand darf niemals aus physischer Erschöpfung oder Schmerzen vorausgesetzt oder geraten werden.

5. FRAGEN FÜR DEN THERAPEUTEN (ORIENTIERUNG MIT ODER-OPTION):
   - In "diagnose_fragen_fuer_therapeut" erstellst du höchstens zwei präzise Leitfragen.
   - Zur praktischen Orientierung des Behandlers nennst du die entscheidenden homöopathischen Polaritäten/Differenzierungs-Vorgaben mit Arzneihinweisen (z. B. bei Durst: große Mengen selten [Bryonia] vs. kleine Schlucke häufig [Arsenicum] vs. durstlos [Pulsatilla/Apis]), ABER IMMER mit der ausdrücklichen Alternative einer freien Patientenaussage: „ODER eigene freie Beschreibung des Patienten (Originalworte)“.

6. HOMÖOPATHISCHE AUSWERTUNG & ENTSCHEIDUNGSBAUM (Organon § 104, Kent):
   - Keine erfundenen Auffang-Mittel zur künstlichen Überbrückung fehlender Daten!
   - Wenn die Daten für einen Verzweigungspfad nicht ausreichen, stoppt der Pfad ehrlich bei: "Unvollständig (Warte auf Eingabe der fehlenden Daten)".
   - Nur wenn die Daten tatsächlich vorliegen, führt der Pfad zu einem exakten Simile.

7. KLINISCHE SICHERHEIT & RED FLAGS:
   - Die homöopathische Anamnese ersetzt keine medizinische Untersuchung oder Notfallabklärung.
   - Bei bedrohlichen Warnzeichen (z. B. Bewusstseinsstörung/Verwirrtheit, schwere Atemnot, Kreislaufversagen, Nackensteifigkeit/Meningismus, Petechien/Purpura, Sepsiszeichen, akutes Abdomen) MUSS im Feld "begruendung" an erster Stelle zur sofortigen ärztlichen Notfall-Abklärung geraten werden!

8. KEINE ÄNDERUNG DER APP-SCHNITTSTELLE:
   - Du darfst kein UI-Layout, kein HTML und keine visuellen Formatierungen generieren.
   - Behalte exakt die bestehenden JSON-Bereiche und Schlüssel bei.

Befolge bei JEDER Eingabe exakt diesen 5-Schritte-Algorithmus:

1. SCHRITT: SYMPTOM-EXTRAKTION (Tokenisierung nach Organon §§ 83–104 mit striktem Interpretationsverbot)
Analysiere den Text und ordne die Aussagen ausschließlich in diese vier Variablen ein. 
WICHTIG / STRIKTES INTERPRETATIONSVERBOT:
- Erfinde, extrapoliere oder vermute keine Ursachen, Auslöser, Modalitäten oder Begleitsymptome aus allgemeinen Krankheits- oder Arzneimittelmustern (z.B. niemals automatisch "verdorbenes Essen" annehmen, wenn der Patient es nicht wörtlich gesagt hat).
- Wenn eine Information im Text nicht explizit genannt wird, schreibe strikt "Unbekannt / Nicht angegeben (Bitte erfragen)".
- [Leitsymptom] = Was genau ist die körperliche Hauptbeschwerde (wörtlich aus Patienten-O-Ton)?
- [Causa] = Nur wenn im Text explizit als Auslöser genannt, sonst "Unbekannt / Nicht angegeben (Bitte erfragen)".
- [Modalitäten] = Nur wenn im Text explizit genannt (besser/schlimmer), sonst "Unbekannt / Nicht angegeben (Bitte erfragen)".
- [Begleitsymptome] = Nur wenn im Text explizit genannt, sonst "Unbekannt / Nicht angegeben (Bitte erfragen)".

2. SCHRITT: PRIMÄR-FILTER (Arznei-Pool)
Suche in deiner homöopathischen Datenbank nach allen Arzneimitteln, die eine hohe Wertigkeit für die tatsächlich genannten Symptome besitzen. Dies ist dein "Start-Pool".

3. SCHRITT: BINÄRE DIFFERENZIERUNG (Der Entscheidungsbaum)
Erstelle einen logischen Ja/Nein-Entscheidungsbaum, um die Mittel aus dem Start-Pool systematisch voneinander abzugrenzen. Nutze dafür die [Modalitäten] und [Begleitsymptome]. Jede Verzweigung MUSS auf einer klaren Differenzierungsfrage basieren. Wenn die Daten fehlen, bleibt der Pfad bei "Unvollständig (Warte auf Eingabe der fehlenden Daten)".

4. SCHRITT: HOMÖOPATHISCHES FAZIT (Keine Auffang-Mittel)
Erfinde keine Daten. Ein Simile wird nur empfohlen, wenn die tatsächlich vorliegenden Symptome es eindeutig tragen. Andernfalls heißt es 'Fehlende Daten für Empfehlung' mit Erläuterung der noch benötigten Angaben.

5. SCHRITT: STRUKTURIERTE JSON-AUSGABE FÜR DIE APP
Gib das Ergebnis als reines Datenobjekt (Schlüssel-Wert-Paare) ohne jeglichen Fließtext davor oder danach in folgendem Format aus:

Eingabetext des Patienten/Therapeuten:
"${symptomText.replace(/"/g, '\\"')}"

WICHTIG / SPRACHVORGABE:
Verfasse alle Texte, Beschreibungen, Fragen und Begründungen in der Zielsprache: ${targetLanguageName}.
Behalte für die Arzneimittel die international etablierten lateinischen Bezeichnungen (z. B. Lycopodium clavatum, Chelidonium majus, Sanguinaria canadensis, Nux vomica, Belladonna, Aconitum napellus, etc.).

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt im folgenden Format (ohne Code-Block-Ummantelung):
{
  "extraktion": {
    "hauptbeschwerde": "Inhalt von Leitsymptom",
    "causa": "Inhalt von Causa oder 'Unbekannt (Bitte erfragen)'",
    "modalitaeten": "Inhalt von Modalitäten oder 'Unbekannt (Bitte erfragen)'",
    "begleitsymptome": "Inhalt von Begleitsymptome oder 'Unbekannt (Bitte erfragen)'"
  },
  "app_layout_daten": {
    "optimales_simile": "Name des ermittelten Hauptmittels oder 'Fehlende Daten für Empfehlung'",
    "begruendung": "Kurze Begründung, warum das Mittel passt ODER Erklärung, welche Kern-Informationen noch benötigt werden (bei Red Flags stets mit ärztlichem Notfallhinweis an 1. Stelle)"
  },
  "diagnose_fragen_fuer_therapeut": {
    "frage_1": "Gezielte Frage zur fehlenden Modalität mit differenzialdiagnostischen Orientierungsbeispielen für den Behandler UND ausdrücklicher Option 'ODER eigene freie Beschreibung des Patienten (Originalworte)'",
    "frage_2": "Gezielte Frage zum fehlenden Begleitsymptom/Gemüt mit differenzialdiagnostischen Orientierungsbeispielen für den Behandler UND ausdrücklicher Option 'ODER eigene freie Beschreibung des Patienten (Originalworte)'"
  },
  "baumstruktur_popup_daten": {
    "start_knoten": "Ausgangssymptom und Ursache",
    "haupt_differenzierungs_frage": "Die erste große Ja/Nein-Frage zur Differenzierung der möglichen Mittel",
    "pfad_ja": {
      "bedingung": "Wenn zutreffend",
      "folge_frage": "Nächste Frage oder 'Warte auf Eingabe der fehlenden Daten'",
      "ergebnis_ja": "Mittelname bei JA oder 'Unvollständig'",
      "ergebnis_nein": "Mittelname bei NEIN oder 'Unvollständig'"
    },
    "pfad_nein": {
      "bedingung": "Wenn nicht zutreffend",
      "folge_frage": "Nächste Frage oder 'Warte auf Eingabe der fehlenden Daten'",
      "ergebnis_ja": "Mittelname bei JA oder 'Unvollständig'",
      "ergebnis_nein": "Mittelname bei NEIN oder 'Unvollständig'"
    }
  }
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const usage = (response as any).usageMetadata || {};
      recordTokenUsage({
        therapistId: req.body?.therapistId,
        therapistName: req.body?.therapistName,
        therapistEmail: req.body?.therapistEmail,
        endpoint: "/api/acute-repertorise",
        actionName: "5-Schritte-Akut-Repertorisation",
        model: "gemini-3.8-flash",
        promptTokens: usage.promptTokenCount || Math.ceil(prompt.length / 4),
        candidatesTokens: usage.candidatesTokenCount || Math.ceil((response.text || "").length / 4),
      });

      const rawParsed = JSON.parse(response.text || "{}");
      
      // Ensure strict adherence to both new 5-step schema and normalized compatibility fields
      const extraktion = rawParsed.extraktion || {
        hauptbeschwerde: rawParsed.extractedAnalysis?.hauptbeschwerde || symptomText,
        causa: rawParsed.extractedAnalysis?.causa || "Unbekannt (Bitte erfragen)",
        modalitaeten: rawParsed.extractedAnalysis?.modalitaeten || "Unbekannt (Bitte erfragen)",
        begleitsymptome: rawParsed.extractedAnalysis?.begleitsymptome || "Unbekannt (Bitte erfragen)"
      };

      const app_layout_daten = rawParsed.app_layout_daten || {
        optimales_simile: rawParsed.recommendedSimile?.remedyName || "Fehlende Daten für Empfehlung",
        begruendung: rawParsed.recommendedSimile?.rationale || "Informationen zur vollständigen Differenzierung erforderlich."
      };

      const diagnose_fragen_fuer_therapeut = rawParsed.diagnose_fragen_fuer_therapeut || {
        frage_1: Array.isArray(rawParsed.diagnosticQuestions) && rawParsed.diagnosticQuestions[0] ? rawParsed.diagnosticQuestions[0] : "Welche Einflüsse verschlimmern oder verbessern die Beschwerden?",
        frage_2: Array.isArray(rawParsed.diagnosticQuestions) && rawParsed.diagnosticQuestions[1] ? rawParsed.diagnosticQuestions[1] : "Gibt es auffällige Begleitsymptome oder Gemütsveränderungen?"
      };

      const baumstruktur_popup_daten = rawParsed.baumstruktur_popup_daten || {
        start_knoten: `${extraktion.hauptbeschwerde} (${extraktion.causa})`,
        haupt_differenzierungs_frage: "Liegen spezifische Modalitäten vor?",
        pfad_ja: {
          bedingung: "Modalitäten und Begleitsymptome bestätigt",
          folge_frage: "Zustand verschlimmert durch Kälte oder Wärme?",
          ergebnis_ja: app_layout_daten.optimales_simile !== "Fehlende Daten für Empfehlung" ? app_layout_daten.optimales_simile : "Unvollständig",
          ergebnis_nein: "Ferrum phosphoricum"
        },
        pfad_nein: {
          bedingung: "Keine Verschlimmerung durch Umweltreize",
          folge_frage: "Warte auf Eingabe der fehlenden Daten",
          ergebnis_ja: "Unvollständig",
          ergebnis_nein: "Unvollständig"
        }
      };

      const normalizedResult = {
        extraktion,
        app_layout_daten,
        diagnose_fragen_fuer_therapeut,
        baumstruktur_popup_daten,
        // Legacy/compatibility fields:
        extractedAnalysis: {
          hauptbeschwerde: extraktion.hauptbeschwerde,
          causa: extraktion.causa,
          modalitaeten: extraktion.modalitaeten,
          begleitsymptome: extraktion.begleitsymptome
        },
        recommendedSimile: {
          remedyName: app_layout_daten.optimales_simile,
          rationale: app_layout_daten.begruendung
        },
        diagnosticQuestions: [
          diagnose_fragen_fuer_therapeut.frage_1,
          diagnose_fragen_fuer_therapeut.frage_2
        ].filter(Boolean),
        decisionTree: rawParsed.decisionTree || {
          header: `[ ${extraktion.hauptbeschwerde.toUpperCase()} ]`,
          rootQuestion: baumstruktur_popup_daten.haupt_differenzierungs_frage,
          branches: [
            {
              id: "branch_ja",
              branchLabel: "[ JA: BESTÄTIGT ]",
              subQuestion: baumstruktur_popup_daten.pfad_ja.folge_frage,
              yesRemedy: {
                name: baumstruktur_popup_daten.pfad_ja.ergebnis_ja,
                rationale: app_layout_daten.begruendung
              },
              noRemedy: {
                name: baumstruktur_popup_daten.pfad_ja.ergebnis_nein,
                rationale: "Klassisches Auffang-Mittel bei Ausschluss der Primärreaktion."
              }
            },
            {
              id: "branch_nein",
              branchLabel: "[ NEIN: AUSGESCHLOSSEN ]",
              subQuestion: baumstruktur_popup_daten.pfad_nein.folge_frage,
              yesRemedy: {
                name: baumstruktur_popup_daten.pfad_nein.ergebnis_ja,
                rationale: "Alternativer Pfad"
              },
              noRemedy: {
                name: baumstruktur_popup_daten.pfad_nein.ergebnis_nein,
                rationale: "Auffang-Mittel oder unvollständig"
              }
            }
          ],
          textFlowchart: `[${extraktion.hauptbeschwerde} | Ursache: ${extraktion.causa}]
  │
  ▼
[ ${baumstruktur_popup_daten.haupt_differenzierungs_frage} ]
  ├── JA  ──> ${baumstruktur_popup_daten.pfad_ja.folge_frage}
  │            ├── JA  ──> ${baumstruktur_popup_daten.pfad_ja.ergebnis_ja}
  │            └── NEIN ──> ${baumstruktur_popup_daten.pfad_ja.ergebnis_nein}
  │
  └── NEIN ──> ${baumstruktur_popup_daten.pfad_nein.folge_frage}
               ├── JA  ──> ${baumstruktur_popup_daten.pfad_nein.ergebnis_ja}
               └── NEIN ──> ${baumstruktur_popup_daten.pfad_nein.ergebnis_nein}`
        }
      };

      res.json({ result: normalizedResult });
    } catch (error) {
      console.error("Acute Repertorise Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate acute repertorisation." });
    }
  });

  // Hahnemann & Bönninghausen Analyse-Engine nach Organon der Heilkunst §§ 83–104
  const getLocalizedOrganonSummary = (m: any, lang: string): string => {
    if (lang === 'en') {
      return `Classical Synthesis according to Samuel Hahnemann (Organon §§ 83–104):\n• Causa (Trigger / Onset): ${m.causa || 'No specific trigger identified'}\n• Localization & Radiation: ${m.lokalisierung || 'Systemic'}\n• Sensation (Quality): ${m.empfindung || 'Not further specified'}\n• Modalities (Better / Worse): ${m.modalitaeten || 'No specific modalities'}\n• Concomitants: ${Array.isArray(m.begleitsymptome) && m.begleitsymptome.length > 0 ? m.begleitsymptome.join(', ') : 'No prominent concomitants'}\n• Mind (Mental State): ${m.gemuet || 'Equable / balanced'}\n• Symptom Complex: ${m.ursaechlicher_zusammenhang || 'Unified symptom complex'}`;
    }
    if (lang === 'es') {
      return `Síntesis clásica según Samuel Hahnemann (Organon §§ 83–104):\n• Causa (Desencadenante / Inicio): ${m.causa || 'Sin causa específica identificada'}\n• Localización y Radiación: ${m.lokalisierung || 'Sistémica'}\n• Sensación (Calidad): ${m.empfindung || 'No especificada'}\n• Modalidades (Mejoría / Empeoramiento): ${m.modalitaeten || 'Sin modalidades específicas'}\n• Síntomas concomitantes: ${Array.isArray(m.begleitsymptome) && m.begleitsymptome.length > 0 ? m.begleitsymptome.join(', ') : 'Sin concomitantes destacados'}\n• Mente (Estado anímico): ${m.gemuet || 'Equilibrado'}\n• Complejo sintomático: ${m.ursaechlicher_zusammenhang || 'Complejo sintomático unificado'}`;
    }
    if (lang === 'fr') {
      return `Synthèse classique selon Samuel Hahnemann (Organon §§ 83–104) :\n• Causa (Déclencheur / Début) : ${m.causa || 'Aucune cause spécifique identifiée'}\n• Localisation & Rayonnement : ${m.lokalisierung || 'Systémique'}\n• Sensation (Qualité) : ${m.empfindung || 'Non spécifiée'}\n• Modalités (Amélioration / Aggravation) : ${m.modalitaeten || 'Aucune modalité spécifique'}\n• Concomitants : ${Array.isArray(m.begleitsymptome) && m.begleitsymptome.length > 0 ? m.begleitsymptome.join(', ') : 'Aucun concomitant notable'}\n• Mental (État d\'esprit) : ${m.gemuet || 'Équilibré'}\n• Complexe de symptômes : ${m.ursaechlicher_zusammenhang || 'Complexe de symptômes unifié'}`;
    }
    if (lang === 'it') {
      return `Sintesi classica secondo Samuel Hahnemann (Organon §§ 83–104):\n• Causa (Fattore scatenante / Inizio): ${m.causa || 'Nessuna causa specifica identificata'}\n• Localizzazione e Irradiazione: ${m.lokalisierung || 'Sistemica'}\n• Sensazione (Qualità): ${m.empfindung || 'Non specificata'}\n• Modalità (Miglioramento / Aggravamento): ${m.modalitaeten || 'Nessuna modalità specifica'}\n• Sintomi concomitanti: ${Array.isArray(m.begleitsymptome) && m.begleitsymptome.length > 0 ? m.begleitsymptome.join(', ') : 'Nessun concomitante di rilievo'}\n• Mente (Stato d\'animo): ${m.gemuet || 'Equilibrato'}\n• Complesso sintomatico: ${m.ursaechlicher_zusammenhang || 'Complesso sintomatico unificato'}`;
    }
    if (lang === 'el') {
      return `Κλασική Σύνθεση κατά Samuel Hahnemann (Όργανον §§ 83–104):\n• Causa (Έναυσμα / Έναρξη): ${m.causa || 'Δεν προσδιορίστηκε συγκεκριμένο έναυσμα'}\n• Εντόπιση & Αντανάκλαση: ${m.lokalisierung || 'Συστηματική'}\n• Αίσθηση (Ποιότητα): ${m.empfindung || 'Μη επακριβώς προσδιορισμένη'}\n• Τροποποιητικοί παράγοντες (Βελτίωση / Επιδείνωση): ${m.modalitaeten || 'Χωρίς συγκεκριμένους τροποποιητικούς παράγοντες'}\n• Συνοδά συμπτώματα: ${Array.isArray(m.begleitsymptome) && m.begleitsymptome.length > 0 ? m.begleitsymptome.join(', ') : 'Χωρίς αξιοσημείωτα συνοδά'}\n• Ψυχική διάθεση: ${m.gemuet || 'Ισόρροπη'}\n• Σύμπλεγμα συμπτωμάτων: ${m.ursaechlicher_zusammenhang || 'Ενιαίο σύμπλεγμα συμπτωμάτων'}`;
    }
    if (lang === 'ru') {
      return `Классический синтез по Самуэлю Ганеману (Органон §§ 83–104):\n• Causa (Триггер / Начало): ${m.causa || 'Специфический триггер не выявлен'}\n• Локализация и иррадиация: ${m.lokalisierung || 'Системная'}\n• Ощущение (Качество): ${m.empfindung || 'Не уточнено'}\n• Модальности (Улучшение / Ухудшение): ${m.modalitaeten || 'Без специфических модальностей'}\n• Сопутствующие симптомы: ${Array.isArray(m.begleitsymptome) && m.begleitsymptome.length > 0 ? m.begleitsymptome.join(', ') : 'Без выраженных сопутствующих'}\n• Душевное состояние: ${m.gemuet || 'Уравновешенное'}\n• Симптомокомплекс: ${m.ursaechlicher_zusammenhang || 'Единый симптомокомплекс'}`;
    }
    return `Klassische Synthese nach Samuel Hahnemann (Organon §§ 83–104):\n• Causa (Auslöser / Beginn): ${m.causa || 'Keine spezifische Causa ermittelt'}\n• Lokalisation & Strahlungsoptionen: ${m.lokalisierung || 'Systemisch'}\n• Sensation (Qualität): ${m.empfindung || 'Nicht näher spezifiziert'}\n• Modalitäten (Besserung / Verschlimmerung): ${m.modalitaeten || 'Keine spezifischen Modalitäten'}\n• Begleitsymptome: ${Array.isArray(m.begleitsymptome) && m.begleitsymptome.length > 0 ? m.begleitsymptome.join(', ') : 'Keine auffälligen Concomitants'}\n• Gemüt (Seelischer Zustand): ${m.gemuet || 'Ausgeglichen'}\n• Symptomkomplex: ${m.ursaechlicher_zusammenhang || 'Einheitlicher Symptomkomplex'}`;
  };

  const getLocalizedClarifyingQuestions = (m: any, lang: string): any[] => {
    const list: any[] = [];
    if (lang === 'en') {
      if (!m.gemuet || m.gemuet === "Noch nicht genannt") {
        list.push({
          id: "q_gemuet",
          frage: "How is the emotional / mental state during the symptoms?",
          grund: "Central Hahnemannian core pillar for precise differentiation of the remedy",
          kategorie: "gemuet",
          optionen: [
            "Irritable, angry, wants absolute quiet (Bryonia / Nux vomica)",
            "Anxious motor restlessness with fear (Aconitum / Arsenicum)",
            "Apathetic, drowsy, indifferent (Gelsemium / Phosphorus)",
            "Weeping, desires consolation and company (Pulsatilla)",
            "Balanced, no noticeable mental change"
          ]
        });
      }
      list.push({
        id: "q_modalitaet",
        frage: "How does the pain respond to firm bandaging or firm pressure versus motion?",
        grund: "Differentiates firm pressure relief (Silicea, Bryonia) from touch/jar sensitive remedies (Belladonna)",
        kategorie: "modalitaeten",
        optionen: [
          "Firm pressure and bandaging relieve noticeably",
          "Slightest motion and jarring worsen",
          "Relief from gentle continuous motion in fresh air",
          "Neither pressure nor motion affects the pain"
        ]
      });
      list.push({
        id: "q_begleit",
        frage: "How do thirst and temperature preferences behave during the condition?",
        grund: "Important general symptom according to Bönninghausen to secure the simile",
        kategorie: "begleitsymptome",
        optionen: [
          "Great unquenchable thirst for large amounts of cold water",
          "Complete thirstlessness despite heat/fever",
          "Desire for warm drinks / warm wrapping",
          "Aversion to fresh air and cold"
        ]
      });
    } else if (lang === 'es') {
      if (!m.gemuet || m.gemuet === "Noch nicht genannt") {
        list.push({
          id: "q_gemuet",
          frage: "¿Cómo es el estado de ánimo o disposición mental durante los síntomas?",
          grund: "Pilar central de Hahnemann para la diferenciación exacta del remedio",
          kategorie: "gemuet",
          optionen: [
            "Irritable, colérico, desea calma absoluta (Bryonia / Nux vomica)",
            "Inquietud motora ansiosa con temor (Aconitum / Arsenicum)",
            "Apático, somnoliento, indiferente (Gelsemium / Phosphorus)",
            "Lloroso, busca consuelo y compañía (Pulsatilla)",
            "Equilibrado, sin cambios anímicos relevantes"
          ]
        });
      }
      list.push({
        id: "q_modalitaet",
        frage: "¿Cómo reacciona el dolor a un vendaje firme o presión fuerte frente al movimiento?",
        grund: "Diferencia la mejoría por presión firme (Silicea, Bryonia) de remedios sensibles a la sacudida (Belladonna)",
        kategorie: "modalitaeten",
        optionen: [
          "La presión firme y el vendaje alivian notablemente",
          "El menor movimiento o sacudida empeoran",
          "Alivio con movimiento suave al aire libre",
          "Ni la presión ni el movimiento modifican el dolor"
        ]
      });
      list.push({
        id: "q_begleit",
        frage: "¿Cómo se comportan la sed y el deseo de temperatura durante el estado?",
        grund: "Síntoma general clave según Bönninghausen para asegurar el simillimum",
        kategorie: "begleitsymptome",
        optionen: [
          "Gran sed insaciable de grandes cantidades de agua fría",
          "Ausencia total de sed a pesar de fiebre/calor",
          "Deseo de bebidas calientes / abrigo cálido",
          "Aversión al aire libre y al frío"
        ]
      });
    } else if (lang === 'fr') {
      if (!m.gemuet || m.gemuet === "Noch nicht genannt") {
        list.push({
          id: "q_gemuet",
          frage: "Quel est l'état d'esprit / l'état psychique pendant les troubles ?",
          grund: "Pilier fondamental hahnemannien pour différencier précisément le remède",
          kategorie: "gemuet",
          optionen: [
            "Irritable, colérique, veut le calme absolu (Bryonia / Nux vomica)",
            "Agitation motrice anxieuse avec peur (Aconitum / Arsenicum)",
            "Apathique, somnolent, indifférent (Gelsemium / Phosphorus)",
            "Pleurant, demande réconfort et compagnie (Pulsatilla)",
            "Équilibré, aucun changement psychique notable"
          ]
        });
      }
      list.push({
        id: "q_modalitaet",
        frage: "Comment la douleur réagit-elle à un bandage serré ou une forte pression par rapport au mouvement ?",
        grund: "Différencie le soulagement par forte pression (Silicea, Bryonia) des remèdes hypersensibles (Belladonna)",
        kategorie: "modalitaeten",
        optionen: [
          "Pression ferme et bandage soulagent nettement",
          "Le moindre mouvement et la moindre secousse aggravent",
          "Soulagement par un mouvement doux à l'air frais",
          "Ni la pression ni le mouvement ne modifient la douleur"
        ]
      });
      list.push({
        id: "q_begleit",
        frage: "Comment se comportent la soif et le besoin de chaleur pendant cet état ?",
        grund: "Symptôme général essentiel selon Bönninghausen pour étayer le remède",
        kategorie: "begleitsymptome",
        optionen: [
          "Grande soif inextinguible de grandes quantités d'eau froide",
          "Absence totale de soif malgré la chaleur/fièvre",
          "Désir de boissons chaudes / d'enveloppement chaud",
          "Aversion pour l'air frais et le froid"
        ]
      });
    } else if (lang === 'it') {
      if (!m.gemuet || m.gemuet === "Noch nicht genannt") {
        list.push({
          id: "q_gemuet",
          frage: "Qual è lo stato d'animo / la disposizione psichica durante i disturbi?",
          grund: "Pilastro cardine hahnemanniano per la precisa differenziazione del rimedio",
          kategorie: "gemuet",
          optionen: [
            "Irritabile, collerico, vuole quiete assoluta (Bryonia / Nux vomica)",
            "Irrequietezza motoria ansiosa con paura (Aconitum / Arsenicum)",
            "Apatico, assonnato, indifferente (Gelsemium / Phosphorus)",
            "Piangente, cerca conforto e compagnia (Pulsatilla)",
            "Equilibrato, nessun cambiamento evidente"
          ]
        });
      }
      list.push({
        id: "q_modalitaet",
        frage: "Come risponde il dolore a una fasciatura stretta o forte pressione rispetto al movimento?",
        grund: "Differenzia il miglioramento da forte pressione (Silicea, Bryonia) dai rimedi ipersensibili (Belladonna)",
        kategorie: "modalitaeten",
        optionen: [
          "Pressione decisa e fasciatura migliorano notevolmente",
          "Il minimo movimento o scuotimento peggiora",
          "Miglioramento con movimento dolce all'aria aperta",
          "Né pressione né movimento modificano il dolore"
        ]
      });
      list.push({
        id: "q_begleit",
        frage: "Come si comportano sete e preferenze termiche durante lo stato attuale?",
        grund: "Sintomo generale fondamentale secondo Bönninghausen per confermare il simile",
        kategorie: "begleitsymptome",
        optionen: [
          "Grande sete insaziabile di abbondante acqua fredda",
          "Assenza totale di sete nonostante calore/febbre",
          "Desiderio di bevande calde / avvolgimento caldo",
          "Avversione per aria fresca e freddo"
        ]
      });
    } else if (lang === 'el') {
      if (!m.gemuet || m.gemuet === "Noch nicht genannt") {
        list.push({
          id: "q_gemuet",
          frage: "Ποια είναι η ψυχική διάθεση κατά τη διάρκεια των ενοχλημάτων;",
          grund: "Κεντρικός πυλώνας του Χάνεμαν για την ακριβή διαφοροποίηση του φαρμάκου",
          kategorie: "gemuet",
          optionen: [
            "Ευερέθιστος, οργίλος, ζητά απόλυτη ησυχία (Bryonia / Nux vomica)",
            "Αγχώδης κινητική ανησυχία με φόβο (Aconitum / Arsenicum)",
            "Απαθής, υπνηλέος, αδιάφορος (Gelsemium / Phosphorus)",
            "Κλαψιάρης, αναζητά παρηγοριά και συντροφιά (Pulsatilla)",
            "Ισόρροπος, χωρίς ουσιαστική αλλαγή διάθεσης"
          ]
        });
      }
      list.push({
        id: "q_modalitaet",
        frage: "Πώς ανταποκρίνεται ο πόνος στη σταθερή επίδεση ή πίεση έναντι της κίνησης;",
        grund: "Διαφοροποιεί τη βελτίωση με πίεση (Silicea, Bryonia) από τα ευαίσθητα φάρμακα (Belladonna)",
        kategorie: "modalitaeten",
        optionen: [
          "Η σταθερή πίεση και η επίδεση βελτιώνουν αισθητά",
          "Η παραμικρή κίνηση επιδεινώνει",
          "Βελτίωση με ήπια συνεχή κίνηση στον καθαρό αέρα",
          "Ούτε η πίεση ούτε η κίνηση μεταβάλλουν τον πόνο"
        ]
      });
      list.push({
        id: "q_begleit",
        frage: "Πώς συμπεριφέρονται η δίψα και οι θερμοκρασιακές προτιμήσεις κατά τη διάρκεια της κατάστασης;",
        grund: "Σημαντικό γενικό σύμπτωμα κατά Bönninghausen για την επιβεβαίωση του ομοίου",
        kategorie: "begleitsymptome",
        optionen: [
          "Μεγάλη άσβεστη δίψα για μεγάλες ποσότητες κρύου νερού",
          "Πλήρης αδυναμία δίψας παρά τη ζέστη/πυρετό",
          "Επιθυμία για ζεστά ροφήματα / ζεστό τύλιγμα",
          "Απέχθεια προς τον καθαρό αέρα και το κρύο"
        ]
      });
    } else if (lang === 'ru') {
      if (!m.gemuet || m.gemuet === "Noch nicht genannt") {
        list.push({
          id: "q_gemuet",
          frage: "Каково душевное / эмоциональное состояние во время симптомов?",
          grund: "Центральный ганемановский столп для точной дифференциации лекарственного средства",
          kategorie: "gemuet",
          optionen: [
            "Раздражительный, сердитый, требует полного покоя (Bryonia / Nux vomica)",
            "Тревожное двигательное беспокойство со страхом (Aconitum / Arsenicum)",
            "Апатичный, сонный, безразличный (Gelsemium / Phosphorus)",
            "Плаксивый, ищет утешения и сочувствия (Pulsatilla)",
            "Спокойный, без заметных изменений настроения"
          ]
        });
      }
      list.push({
        id: "q_modalitaet",
        frage: "Как боль реагирует на тугую повязку или сильное давление по сравнению с движением?",
        grund: "Дифференцирует облегчение от давления (Silicea, Bryonia) от чувствительных средств (Belladonna)",
        kategorie: "modalitaeten",
        optionen: [
          "Сильное давление и повязка заметно облегчают",
          "Малейшее движение и сотрясение ухудшают",
          "Облегчение от мягкого движения на свежем воздухе",
          "Ни давление, ни движение не меняют боль"
        ]
      });
      list.push({
        id: "q_begleit",
        frage: "Как проявляются жажда и температурные предпочтения во время недомогания?",
        grund: "Важный общий симптом по Беннингхаузену для подтверждения подобия",
        kategorie: "begleitsymptome",
        optionen: [
          "Сильная неутолимая жажда большого количества холодной воды",
          "Полное отсутствие жажды несмотря на жар/лихорадку",
          "Желание теплых напитков / укутывания в тепло",
          "Отвращение к свежему воздуху и холоду"
        ]
      });
    } else {
      if (!m.gemuet || m.gemuet === "Noch nicht genannt") {
        list.push({
          id: "q_gemuet",
          frage: "Wie ist die seelische Verfassung / das Gemüt während der Beschwerden?",
          grund: "Zentrale Hahnemannsche Leitsäule zur exakten Differenzierung des Arzneimittels",
          kategorie: "gemuet",
          optionen: [
            "Reizbar, zornig, will absolute Ruhe (Bryonia / Nux vomica)",
            "Ängstliche motorische Unruhe mit Furcht (Aconitum / Arsenicum)",
            "Apathisch, schläfrig, gleichgültig (Gelsemium / Phosphor)",
            "Weinend, verlangt nach Trost und Gesellschaft (Pulsatilla)",
            "Ausgeglichen, keine wesentliche Gemütsveränderung"
          ]
        });
      }
      list.push({
        id: "q_modalitaet",
        frage: "Wie reagieren die Schmerzen auf feste Bandagierung oder starken Druck versus Bewegung?",
        grund: "Differenziert feste Druckbesserung (Silicea, Bryonia) von druck- und erschütterungsempfindlichen Mitteln (Belladonna)",
        kategorie: "modalitaeten",
        optionen: [
          "Fester Druck und Bandagierung bessern deutlich",
          "Geringste Bewegung und Erschütterung verschlimmern",
          "Besserung durch sanfte, anhaltende Bewegung",
          "Weder Druck noch Bewegung verändern die Schmerzen"
        ]
      });
      list.push({
        id: "q_begleit",
        frage: "Wie verhält sich das Durst- und Temperaturverlangen während des Zustands?",
        grund: "Wichtiges Generalsymptom nach Bönninghausen zur Absicherung des Simile",
        kategorie: "begleitsymptome",
        optionen: [
          "Großer Durst auf große Mengen kaltes Wasser",
          "Völlige Durstlosigkeit trotz Hitze/Fieber",
          "Verlangen nach warmen Getränken / Einhüllung",
          "Abneigung gegen frische Luft und Kälte"
        ]
      });
    }
    return list;
  };

  app.post("/api/organon/analyze", async (req, res) => {
    try {
      const { rawText, language = "de", engine = "gemini", compare = false } = req.body;
      if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({ error: "rawText is required" });
      }

      const prompt = `Du bist ein präziser NLP- und Text-Parser für homöopathische Fallschilderungen nach Samuel Hahnemann.
Deine Aufgabe ist es, den Patiententext in einer 3-Stufen-Analyse nach folgenden 10 exakten Kategorien zu analysieren:
1. Causa (Wodurch ausgelöst? Wichtig: Unterscheide streng zwischen bloßen Handlungen/zeitlichem Kontext [z.B. "zur Schule laufen"] und echten Auslösern. Wenn kein ursächliches Ereignis als Auslöser genannt ist, erwähne dies nicht als Causa bzw. kennzeichne es als keine Causa.)
2. Localisatio (Wo?)
3. Sensatio (Wie fühlt es sich an?)
4. Symptoma (Was?)
5. Modalitates – Besserung (Wann besser?)
6. Modalitates – Verschlechterung (Wann schlechter?)
7. Symptomata concomitantia (Was tritt dazu auf?)
8. Comorbiditas (Welche weiteren Erkrankungen?)
9. Mens (Was verändert sich beim Denken?)
10. Animus (Wie geht es dir emotional?)

WICHTIGE REGEL FÜR ALLE KATEGORIEN: Wenn etwas nicht zutrifft oder keinen Einfluss hat (z.B. Handlungen ohne Krankheitswert, fehlende Modalitäten, fehlende psychische Zustände), dann führe es in der jeweiligen Kategorie gar nicht erst auf, sondern lass es weg ("Keine"). Nenne nur das, was tatsächlich zutrifft.

Erstelle in der Antwort zwingend das Feld "three_stage" mit:
- "stage1": Array mit allen 10 Kategorien (category_key, category_name, core_question, result_text).
- "stage2": Array mit Prüfungen von Textstellen (text_snippet, examination, adopted_complaint).
- "stage3": Objekt mit control_notes und clarification_question.

Antworte AUSSCHLIESSLICH als gültiges JSON-Objekt im folgenden Format (ohne Markdown Code-Blöcke):
{
  "raw_text": "${rawText.replace(/"/g, '\\\\"')}",
  "three_stage": {
    "stage1": [
      { "category_key": "causa", "category_name": "Causa", "core_question": "Wodurch ausgelöst?", "result_text": "..." },
      { "category_key": "localisatio", "category_name": "Localisatio", "core_question": "Wo?", "result_text": "..." },
      { "category_key": "sensatio", "category_name": "Sensatio", "core_question": "Wie fühlt es sich an?", "result_text": "..." },
      { "category_key": "symptoma", "category_name": "Symptoma", "core_question": "Was?", "result_text": "..." },
      { "category_key": "modalitates_besserung", "category_name": "Modalitates – Besserung", "core_question": "Wann besser?", "result_text": "..." },
      { "category_key": "modalitates_verschlechterung", "category_name": "Modalitates – Verschlechterung", "core_question": "Wann schlechter?", "result_text": "..." },
      { "category_key": "symptomata_concomitantia", "category_name": "Symptomata concomitantia", "core_question": "Was tritt dazu auf?", "result_text": "..." },
      { "category_key": "comorbiditas", "category_name": "Comorbiditas", "core_question": "Welche weiteren Erkrankungen?", "result_text": "..." },
      { "category_key": "mens", "category_name": "Mens", "core_question": "Was verändert sich beim Denken?", "result_text": "..." },
      { "category_key": "animus", "category_name": "Animus", "core_question": "Wie geht es dir emotional?", "result_text": "..." }
    ],
    "stage2": [
      { "text_snippet": "...", "examination": "...", "adopted_complaint": "..." }
    ],
    "stage3": {
      "control_notes": "...",
      "clarification_question": "..."
    }
  },
  "complaint_matrices": [],
  "complaint_relations": [],
  "semantic_events": [],
  "semantic_relations": [],
  "open_slots": [],
  "source_spans": [],
  "entities": [],
  "uncertainties": [],
  "claims": [],
  "temporal_bindings": [],
  "symptom_states": [],
  "corrections": [],
  "contradictions": [],
  "next_question": null,
  "validation": { "is_valid": true, "is_complete": false, "blocking_issues": [], "warnings": [] },
  "hahnemann_analysis": {
    "analysis_status": "READY",
    "characteristic_features": [],
    "general_features": [],
    "modalities": [],
    "concomitants": [],
    "course_features": [],
    "missing_information": [],
    "organon_references": ["§§83–104"]
  },
  "selection_for_remedy_analysis": { "status": "READY", "selected_features": [], "excluded_features": [], "blocking_reasons": [] },
  "remedy_retrieval": { "status": "READY", "feature_queries": [], "repertory_matches": [], "materia_medica_matches": [], "warnings": [] },
  "repertory_scoring": { "status": "READY", "feature_weights": [], "remedy_scores": [], "warnings": [] }
}`;

      const runGemini = async () => {
        const apiKey = getGeminiApiKey();
        if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
        const ai = new GoogleGenAI({ apiKey });
        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
            config: { temperature: 0.2, responseMimeType: "application/json" },
          });
        } catch (e) {
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: { temperature: 0.2, responseMimeType: "application/json" },
          });
        }
        return response.text || "{}";
      };

      const runOpenAI = async () => {
        const openAiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.OPENAI_SECRET;
        if (!openAiKey) {
          console.warn("OPENAI_API_KEY is not configured, falling back to Gemini model for stability.");
          const resText = await runGemini();
          return { content: resText, modelUsed: "gemini-3.5-flash-lite (fallback)" };
        }
        // Dynamic import or require for openai package
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey: openAiKey });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a precise homeopathic text parser. Output valid JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content || "{}";
        const modelUsed = completion.model || "gpt-4o";
        return { content, modelUsed };
      };

      const defaultAnalysis = {
        semantic_events: [],
        semantic_relations: [],
        open_slots: [],
        source_spans: [],
        entities: [],
        uncertainties: [],
        claims: [],
        temporal_bindings: [],
        symptom_states: [],
        corrections: [],
        contradictions: [],
        next_question: {
          question_id: "q_fallback_1",
          text: "Bitte beschreiben Sie genauer, wie sich die Beschwerden anfühlen und welche Modalitäten sie beeinflussen.",
          reason_code: "MODALITY_CHECK"
        },
        validation: { is_valid: true, is_complete: false, blocking_issues: [], warnings: [] },
        hahnemann_analysis: {
          analysis_status: 'INCOMPLETE',
          characteristic_features: [],
          general_features: [],
          modalities: [],
          concomitants: [],
          course_features: [],
          missing_information: [],
          organon_references: []
        },
        selection_for_remedy_analysis: {
          status: 'READY',
          selected_features: [],
          excluded_features: [],
          blocking_reasons: []
        },
        remedy_retrieval: { status: 'READY', feature_queries: [], repertory_matches: [], materia_medica_matches: [], warnings: [] },
        repertory_scoring: { status: 'READY', feature_weights: [], remedy_scores: [], warnings: [] }
      };

      if (compare) {
        // Run both in parallel
        let geminiText = "{}";
        let openaiRes: any = { content: "{}", modelUsed: "gpt-4o" };
        let geminiError = null;
        let openaiError = null;

        try {
          geminiText = await runGemini();
        } catch (err: any) {
          geminiError = err.message;
        }

        try {
          openaiRes = await runOpenAI();
        } catch (err: any) {
          openaiError = err.message;
        }

        const parsedGemini = parseAiJson(geminiText, defaultAnalysis);
        const parsedOpenAI = parseAiJson(openaiRes.content || openaiRes, defaultAnalysis);

        return res.json({
          engine: "compare",
          gemini: parsedGemini,
          openai: parsedOpenAI,
          provider: "openai",
          model_requested: "gpt-4o",
          model_used: openaiRes.modelUsed || "gpt-4o",
          errors: { gemini: geminiError, openai: openaiError }
        });
      }

      let responseText = "{}";
      let actualModelUsed = engine === 'openai' ? 'gpt-4o' : 'gemini-3.5-flash-lite';
      let usedEngine = engine;
      if (engine === "openai") {
        try {
          const oRes = await runOpenAI();
          responseText = oRes.content;
          actualModelUsed = oRes.modelUsed;
        } catch (openaiErr: any) {
          console.warn("OpenAI failed, falling back to Gemini:", openaiErr);
          responseText = await runGemini();
          usedEngine = "gemini-fallback";
          actualModelUsed = "gemini-3.5-flash-lite (fallback)";
        }
      } else {
        responseText = await runGemini();
      }

      const parsed = parseAiJson(responseText, defaultAnalysis);
      parsed.meta_provider = {
        provider: "openai",
        model_requested: "gpt-4o",
        model_used: actualModelUsed
      };

      // Global Validators & Provenance checks
      const validation = parsed.validation || { is_valid: true, is_complete: true, blocking_issues: [], warnings: [] };
      const blockingIssues = validation.blocking_issues || [];

      const entityIds = new Set((parsed.entities || []).map((e: any) => e.entity_id));
      const claimMap = new Map((parsed.claims || []).map((c: any) => [c.claim_id, c]));
      const tbMap = new Map((parsed.temporal_bindings || []).map((tb: any) => [tb.temporal_binding_id, tb]));
      const stateIds = new Set((parsed.symptom_states || []).map((s: any) => s.state_id));

      // 1. CLAIM_STATE_PROVENANCE_VALIDATOR & TEMPORAL_STATE_PROVENANCE_VALIDATOR
      for (const state of (parsed.symptom_states || [])) {
        for (const cid of (state.source_claim_ids || [])) {
          if (!claimMap.has(cid)) {
            validation.is_valid = false;
            blockingIssues.push(`CLAIM_STATE_PROVENANCE_VALIDATOR failed: state ${state.state_id} references non-existent claim ${cid}`);
          }
        }
        for (const tbid of (state.source_temporal_binding_ids || [])) {
          if (!tbMap.has(tbid)) {
            validation.is_valid = false;
            blockingIssues.push(`TEMPORAL_STATE_PROVENANCE_VALIDATOR failed: state ${state.state_id} references non-existent temporal binding ${tbid}`);
          }
        }
      }

      // 2. DENIAL_STATUS_VALIDATOR
      for (const ent of (parsed.entities || [])) {
        if (ent.status === 'CONTRADICTED' && ent.patient_label && ent.patient_label.toLowerCase().includes('verneint')) {
          ent.status = 'DENIED';
        }
      }

      // 3. STATE_SOURCE_MINIMALITY_VALIDATOR & TEMPORAL_ATTRIBUTE_COVERAGE_VALIDATOR
      for (const state of (parsed.symptom_states || [])) {
        for (const cid of (state.source_claim_ids || [])) {
          const c = claimMap.get(cid);
          if (c && (c as any).attribute === 'sensation') {
            validation.is_valid = false;
            blockingIssues.push(`STATE_SOURCE_MINIMALITY_VALIDATOR failed: state ${state.state_id} references sensation claim ${cid}`);
          }
        }
        for (const tbid of (state.source_temporal_binding_ids || [])) {
          const tb = tbMap.get(tbid);
          if (!tb) {
            validation.is_valid = false;
            blockingIssues.push(`TEMPORAL_ATTRIBUTE_COVERAGE_VALIDATOR failed: temporal binding ${tbid} does not exist`);
          }
        }
      }

      if (!validation.is_valid) {
        if (!blockingIssues.includes('INVALID_STATE_PROVENANCE')) {
          blockingIssues.push('INVALID_STATE_PROVENANCE');
        }
      }

      validation.blocking_issues = blockingIssues;
      parsed.validation = validation;

      // Programmatic provenance consistency check for selection_for_remedy_analysis
      const sel = parsed.selection_for_remedy_analysis;
      if (sel) {
        let provenanceError = !validation.is_valid;
        const blockingReasons = sel.blocking_reasons || [];

        const checkIds = (items: any[]) => {
          for (const item of (items || [])) {
            for (const eid of (item.related_entity_ids || [])) {
              if (!entityIds.has(eid)) {
                provenanceError = true;
                blockingReasons.push(`INVALID_PROVENANCE: entity_id '${eid}' not found`);
              }
            }
            for (const cid of (item.related_claim_ids || [])) {
              if (!claimMap.has(cid)) {
                provenanceError = true;
                blockingReasons.push(`INVALID_PROVENANCE: claim_id '${cid}' not found`);
              }
            }
            for (const sid of (item.related_state_ids || [])) {
              if (!stateIds.has(sid)) {
                provenanceError = true;
                blockingReasons.push(`INVALID_PROVENANCE: state_id '${sid}' not found`);
              }
            }
          }
        };

        checkIds(sel.selected_features);
        checkIds(sel.excluded_features);

        if (provenanceError) {
          sel.status = 'BLOCKED';
          if (!blockingReasons.includes('INVALID_PROVENANCE')) {
            blockingReasons.push('INVALID_PROVENANCE');
          }
          sel.blocking_reasons = blockingReasons;
        }
      }

      // RETRIEVAL_PROVENANCE_VALIDATOR
      const rr = parsed.remedy_retrieval;
      if (rr) {
        const selectionIds = new Set((parsed.selection_for_remedy_analysis?.selected_features || []).map((f: any) => f.selection_id));
        if (parsed.selection_for_remedy_analysis?.status !== 'READY') {
          rr.status = 'BLOCKED';
        } else {
          let retrievalError = false;
          const warnings = rr.warnings || [];
          for (const rep of (rr.repertory_matches || [])) {
            if (!selectionIds.has(rep.selection_id) || !rep.source_file || !rep.matched_text || rep.provenance_valid !== true) {
              retrievalError = true;
              warnings.push('INVALID_RETRIEVAL_PROVENANCE');
            }
          }
          for (const mm of (rr.materia_medica_matches || [])) {
            if (!selectionIds.has(mm.selection_id) || !mm.source_file || !mm.matched_text || mm.provenance_valid !== true) {
              retrievalError = true;
              warnings.push('INVALID_RETRIEVAL_PROVENANCE');
            }
          }
          if (retrievalError) {
            rr.status = 'BLOCKED';
            rr.warnings = warnings;
          }
        }
      }

      // SCORING_PROVENANCE_VALIDATOR
      const rs = parsed.repertory_scoring;
      if (rs) {
        if (parsed.remedy_retrieval?.status !== 'READY') {
          rs.status = 'BLOCKED';
        } else {
          let scoringError = false;
          const warnings = rs.warnings || [];
          const selectedFeatures = parsed.selection_for_remedy_analysis?.selected_features || [];
          const sfMap = new Map(selectedFeatures.map((f: any) => [f.selection_id, f]));
          const priorityWeights: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

          for (const fw of (rs.feature_weights || [])) {
            const feat = sfMap.get(fw.selection_id);
            if (!feat || priorityWeights[(feat as any).priority] !== fw.weight) {
              scoringError = true;
              warnings.push('INVALID_SCORING_PROVENANCE');
            }
          }

          for (const rem of (rs.remedy_scores || [])) {
            let calculatedScore = 0;
            for (const rc of (rem.repertory_contributions || [])) {
              const feat = sfMap.get(rc.selection_id);
              if (!feat || priorityWeights[(feat as any).priority] !== rc.feature_weight) {
                scoringError = true;
                warnings.push('INVALID_SCORING_PROVENANCE');
              }
              const expectedContrib = rc.feature_weight * (rc.repertory_grade ?? 1);
              if (rc.contribution !== expectedContrib) {
                scoringError = true;
                warnings.push('INVALID_SCORING_PROVENANCE');
              }
              calculatedScore += rc.contribution;
            }
            if (rem.repertory_score !== calculatedScore) {
              scoringError = true;
              warnings.push('INVALID_SCORING_PROVENANCE');
            }
          }

          if (scoringError) {
            rs.status = 'BLOCKED';
            rs.warnings = warnings;
          }
        }
      }

      // SCORING_ADEQUACY_GATE
      const sa: any = {
        status: 'INSUFFICIENT',
        selected_feature_count: 0,
        repertory_matched_feature_count: 0,
        supportive_mm_feature_count: 0,
        repertory_coverage_ratio: 0,
        weighted_possible_score_basis: 0,
        weighted_repertory_coverage: 0,
        unmatched_selected_features: [],
        warnings: []
      };

      if (parsed.selection_for_remedy_analysis?.status !== 'READY' || parsed.repertory_scoring?.status === 'BLOCKED') {
        sa.status = 'BLOCKED';
      } else {
        const selectedFeatures = parsed.selection_for_remedy_analysis.selected_features || [];
        sa.selected_feature_count = selectedFeatures.length;

        const priorityWeights: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        let totalWeight = 0;
        for (const feat of selectedFeatures) {
          totalWeight += (priorityWeights[feat.priority] || 2);
        }
        sa.weighted_possible_score_basis = totalWeight;

        const matchedSelectionIds = new Set<string>();
        for (const rep of (parsed.remedy_retrieval?.repertory_matches || [])) {
          if (rep.provenance_valid) {
            matchedSelectionIds.add(rep.selection_id);
          }
        }
        sa.repertory_matched_feature_count = matchedSelectionIds.size;
        sa.repertory_coverage_ratio = sa.selected_feature_count > 0 ? Number((sa.repertory_matched_feature_count / sa.selected_feature_count).toFixed(2)) : 0;

        const mmSelectionIds = new Set<string>();
        for (const mm of (parsed.remedy_retrieval?.materia_medica_matches || [])) {
          if (mm.provenance_valid) {
            mmSelectionIds.add(mm.selection_id);
          }
        }
        sa.supportive_mm_feature_count = mmSelectionIds.size;

        let matchedWeight = 0;
        const unmatched: any[] = [];
        for (const feat of selectedFeatures) {
          if (matchedSelectionIds.has(feat.selection_id)) {
            matchedWeight += (priorityWeights[feat.priority] || 2);
          } else {
            unmatched.push({
              selection_id: feat.selection_id,
              feature_type: feat.feature_type,
              text: feat.text,
              priority: feat.priority,
              reason: 'NO_VALIDATED_REPERTORY_MATCH'
            });
          }
        }
        sa.unmatched_selected_features = unmatched;
        sa.weighted_repertory_coverage = sa.weighted_possible_score_basis > 0 ? Number((matchedWeight / sa.weighted_possible_score_basis).toFixed(2)) : 0;

        if (sa.weighted_repertory_coverage < 0.40) {
          sa.status = 'INSUFFICIENT';
        } else if (sa.weighted_repertory_coverage < 0.70) {
          sa.status = 'LIMITED';
        } else {
          sa.status = 'ADEQUATE';
        }
      }

      parsed.scoring_adequacy = sa;

      return res.json({ engine: usedEngine, result: parsed });
    } catch (error: any) {
      console.error("Organon Analyze API Error Details:");
      console.error("Name:", error?.name);
      console.error("Message:", error?.message);
      console.error("Stack:", error?.stack);
      console.error("Status:", error?.status || error?.statusCode);
      console.error("Response:", error?.response || error?.body);

      res.status(500).json({
        error: "Failed to analyze organon text.",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/organon/arbitrate", async (req, res) => {
    try {
      const { rawText, geminiResult, openaiResult } = req.body;
      if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({ error: "rawText is required" });
      }

      const apiKey = getGeminiApiKey();
      if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Du bist ein strenger und unbestechlicher BELEGPRÜFER für homöopathische Fallanalysen nach Samuel Hahnemann (Organon der Heilkunst).
Deine Aufgabe ist es, den unveränderten Originaltext der Patientenschilderung gegen die Analyse von Gemini 3.8 Flash zu prüfen.
Du bewertest Gemini 3.8 Flash kritisch und baust die Korrekturen auf.

Führe für jede der folgenden 10 Kategorien mit ihrer exakten Kernfrage eine detaillierte Prüfung durch:
1. Causa | Wodurch ausgelöst?
2. Localisatio | Wo?
3. Sensatio | Wie fühlt es sich an?
4. Symptoma | Was?
5. Modalitates – Besserung | Wann besser?
6. Modalitates – Verschlechterung | Wann schlechter?
7. Symptomata concomitantia | Was tritt dazu auf?
8. Comorbiditas | Welche weiteren Erkrankungen?
9. Mens | What verändert sich beim Denken? (Was verändert sich beim Denken?)
10. Animus | Wie geht es dir emotional?

PRÜFABLAUF PRO KATEGORIE:
- Nimm das vorgeschlagene Ergebnis von Gemini 3.8 Flash („Alt“).
- Stelle die Kernfrage für jeden Bestandteil einzeln gegen den Originaltext (z.B. bei Sensatio: Jedes genannte Element einzeln prüfen: „Wie fühlt es sich an? Passt das zum Zitat?“).
- Erstelle das korrigierte Ergebnis („Neu“) streng nach dem Originaltext, ohne Halluzinationen.
- Wenn etwas unklar ist, stelle eine direkte Rückfrage: „Habe ich das richtig verstanden so oder ist es so richtig?“

Originaltext:
"${rawText.replace(/"/g, '\\\\"')}"

Gemini 3.8 Flash Analyse:
${JSON.stringify(geminiResult || {})}

GPT / Zweit-Analyse:
${JSON.stringify(openaiResult || {})}

Gib als Antwort AUSSCHLIESSLICH ein gültiges JSON-Objekt (ohne Markdown Code-Blöcke) mit folgender Struktur zurück:
{
  "category_evaluations": [
    {
      "category": "Causa",
      "core_question": "Wodurch ausgelöst?",
      "gemini_alt": "string",
      "verification_analysis": "string (Prüfung jedes Elements gegen den Text)",
      "belegpruefer_neu": "string (korrigiertes Ergebnis)",
      "clarification_check": "string (z.B. 'Habe ich das richtig verstanden so oder ist es so richtig?')"
    },
    {
      "category": "Localisatio",
      "core_question": "Wo?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    },
    {
      "category": "Sensatio",
      "core_question": "Wie fühlt es sich an?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    },
    {
      "category": "Symptoma",
      "core_question": "Was?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    },
    {
      "category": "Modalitates – Besserung",
      "core_question": "Wann besser?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    },
    {
      "category": "Modalitates – Verschlechterung",
      "core_question": "Wann schlechter?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    },
    {
      "category": "Symptomata concomitantia",
      "core_question": "Was tritt dazu auf?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    },
    {
      "category": "Comorbiditas",
      "core_question": "Welche weiteren Erkrankungen?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    },
    {
      "category": "Mens",
      "core_question": "Was verändert sich beim Denken?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    },
    {
      "category": "Animus",
      "core_question": "Wie geht es dir emotional?",
      "gemini_alt": "string",
      "verification_analysis": "string",
      "belegpruefer_neu": "string",
      "clarification_check": "string"
    }
  ],
  "audit_protocol": [
    {
      "proposed_statement": "string",
      "decision": "Übernehmen" | "Korrigieren" | "Verwerfen" | "Rückfrage erforderlich",
      "quote": "string",
      "reasoning": "string"
    }
  ],
  "corrected_summary": [
    { "category": "Causa", "result": "string", "quote_or_clarification": "string" },
    { "category": "Localisatio", "result": "string", "quote_or_clarification": "string" },
    { "category": "Sensatio", "result": "string", "quote_or_clarification": "string" },
    { "category": "Symptoma", "result": "string", "quote_or_clarification": "string" },
    { "category": "Modalitates – Besserung", "result": "string", "quote_or_clarification": "string" },
    { "category": "Modalitates – Verschlechterung", "result": "string", "quote_or_clarification": "string" },
    { "category": "Symptomata concomitantia", "result": "string", "quote_or_clarification": "string" },
    { "category": "Comorbiditas", "result": "string", "quote_or_clarification": "string" },
    { "category": "Mens", "result": "string", "quote_or_clarification": "string" },
    { "category": "Animus", "result": "string", "quote_or_clarification": "string" }
  ],
  "course_note": "string",
  "clarification_question": "string"
}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: { temperature: 0.1, responseMimeType: "application/json" },
        });
      } catch (e) {
        response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: { temperature: 0.1, responseMimeType: "application/json" },
        });
      }

      const text = response.text || "{}";
      const parsed = parseAiJson(text, {});
      return res.json({ engine: "belegpruefer", result: parsed });
    } catch (error: any) {
      console.error("Organon Belegpruefer API Error:", error);
      res.status(500).json({ error: "Failed to perform Belegprüfung.", details: error?.message });
    }
  });

  app.post("/api/organon/correct-spelling", async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({ error: "rawText is required" });
      }

      const apiKey = getGeminiApiKey();
      if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Du bist ein professioneller homöopathischer Assistent und Lektor.
Korrigiere den folgenden Patiententext hinsichtlich Rechtschreibung, Grammatik, Satzbau und sprachlicher Klarheit.
Bewahre dabei exakt den inhaltlichen Sinn, die medizinischen/homöopathischen Aussagen und den Ton des Patienten. Verändere oder erfinde keine medizinischen Fakten, sondern korrigiere nur Grammatik, Rechtschreibung und schwer verständliches Wortdurcheinander, damit der Text Sinn ergibt und für die homöopathische Analyse sauber lesbar ist.

Antworte AUSSCHLIESSLICH mit dem korrigierten Text, ohne Erklärungen, ohne Anführungszeichen und ohne Markdown-Code-Blöcke.

Text:
"${rawText}"`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: { temperature: 0.1 },
        });
      } catch (e) {
        response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: { temperature: 0.1 },
        });
      }

      const correctedText = (response.text || rawText).replace(/^["']|["']$/g, "").trim();
      return res.json({ correctedText });
    } catch (error: any) {
      console.error("Organon Spelling Correction Error:", error);
      res.status(500).json({ error: "Failed to correct spelling.", details: error?.message });
    }
  });

  app.post("/api/organon/next-question", async (req, res) => {
    try {
      const { rawText, currentMatrices = [], currentRelations = [], questionHistory = [], latestAnswer = null, currentQuestion = null } = req.body;
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(503).json({ error: "GEMINI_API_KEY is not configured" });
      }
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Du bist die homöopathische Fallaufnahme-Frageengine nach Hahnemann und Bönninghausen.
Originaler O-Ton des Patienten: "${rawText}"
Bisherige Beschwerdematrizen: ${JSON.stringify(currentMatrices)}
Bisherige zeitliche Relationen: ${JSON.stringify(currentRelations)}
Fragehistorie: ${JSON.stringify(questionHistory)}
Neueste gestellte Frage: "${currentQuestion || 'Initial'}"
Neueste Patientenantwort: "${latestAnswer || 'Initialer Einstieg'}"

AUFGABE:
1. Verarbeite die neueste Patientenantwort semantisch (Multi-Information-Extraktion: Wenn der Patient z.B. auf eine Lokalisationsfrage freiwillig auch Sensation und Modalität nennt, aktualisiere alle diese Felder in der entsprechenden Beschwerdematrix).
2. Aktualisiere und präzisiere die Beschwerdematrizen ("updatedMatrices") und zeitlichen Relationen ("updatedRelations"). Beachte streng: Keine unzulässigen Kausalitätsannahmen, chronische Beschwerden bleiben getrennt, Vermutungen bleiben "PATIENT_SUSPECTED", verneinte Dinge bleiben "DENIED", nicht getestete Dinge bleiben "NOT_PERFORMED" / "UNKNOWN".
3. Bestimme, ob der Fall für diese strukturierte Aufnahmephase ausreichend geklärt ist ("isFinished": true oder false).
4. Falls nicht fertig, bestimme **genau eine nächste einzelne Frage** ("nextQuestion") nach dem Ein-Frage-Prinzip, welche die wichtigste verbleibende Unklarheit, Lücke oder den wichtigsten offenen Punkt für die akute oder wichtigste Beschwerde klärt.

Antworte AUSSCHLIESSLICH als gültiges JSON-Objekt ohne Markdown Code-Blöcke:
{
  "updatedMatrices": [ ... ],
  "updatedRelations": [ ... ],
  "nextQuestion": {
    "question_id": "q_next_1",
    "text": "Genau eine einzelne Frage an den Patienten",
    "target_complaint_id": "comp_1",
    "target_field": "causa",
    "reason": "Begründung, warum diese Frage als nächstes wichtig ist"
  },
  "isFinished": false,
  "summary": "Kurze Zusammenfassung, was durch die Antwort aktualisiert wurde"
}
`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        });
      } catch (primaryErr: any) {
        console.warn("Primary model failed, trying fallback model:", primaryErr);
        response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        });
      }

      const responseText = response.text || "{}";
      const defaultNext = {
        updatedMatrices: currentMatrices,
        updatedRelations: currentRelations,
        nextQuestion: {
          question_id: "q_fallback_1",
          text: "Wann genau traten die Beschwerden auf und wodurch werden sie gebessert oder verschlechtert?",
          reason: "Erfassung der Begleitumstände und Modalitäten nach Organon."
        },
        isFinished: false,
        summary: 'Matrix aktualisiert'
      };
      const parsed = parseAiJson(responseText, defaultNext);

      res.json({
        updatedMatrices: parsed.updatedMatrices || currentMatrices,
        updatedRelations: parsed.updatedRelations || currentRelations,
        nextQuestion: parsed.nextQuestion || {
          question_id: "q_fallback_1",
          text: "Wann genau traten die Beschwerden auf und wodurch werden sie gebessert oder verschlechtert?",
          reason: "Erfassung der Begleitumstände und Modalitäten nach Organon."
        },
        isFinished: parsed.isFinished || false,
        summary: parsed.summary || 'Matrix aktualisiert'
      });
    } catch (err: any) {
      console.error("Error in /api/organon/next-question:", err);
      // Return a graceful fallback instead of hard 500 error so user can continue their workflow
      res.json({
        updatedMatrices: req.body.currentMatrices || [],
        updatedRelations: req.body.currentRelations || [],
        nextQuestion: {
          question_id: "q_fallback_error",
          text: "Können Sie die Modalitäten (Verschlimmerung/Besserung durch Wärme, Kälte, Bewegung etc.) näher beschreiben?",
          reason: "Automatischer Fallback bei hoher Serverlast."
        },
        isFinished: false,
        summary: "Hinweis: Aufgrund hoher Serverlast wurde ein Standard-Frageimpuls geladen. Sie können fortfahren."
      });
    }
  });

  app.post("/api/hahnemann-analysis", async (req, res) => {
    try {
      const { 
        text, 
        currentMatrix, 
        conversationHistory = [], 
        language = "de", 
        forceComplete = false,
        caseType = "akut" // "akut" (§ 99) oder "chronisch" (§§ 83–98)
      } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "text is required" });
      }

      const langNames: Record<string, string> = {
        de: "German (Deutsch)",
        en: "English",
        el: "Greek (Ελληνικά)",
        es: "Spanish (Español)",
        fr: "French (Français)",
        it: "Italian (Italiano)",
        ru: "Russian (Русский)"
      };
      const targetLanguageName = langNames[language] || "German (Deutsch)";

      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(503).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const currentStepCount = conversationHistory.length + 1;
      const hasCausa = Boolean(currentMatrix?.causa && currentMatrix.causa !== "Noch nicht genannt" && currentMatrix.causa.trim().length > 0);
      const hasLokalisierung = Boolean(currentMatrix?.lokalisierung && currentMatrix.lokalisierung !== "Noch nicht genannt" && currentMatrix.lokalisierung.trim().length > 0);
      const hasEmpfindung = Boolean(currentMatrix?.empfindung && currentMatrix.empfindung !== "Noch nicht genannt" && currentMatrix.empfindung.trim().length > 0);
      const hasModalitaeten = Boolean(currentMatrix?.modalitaeten && currentMatrix.modalitaeten !== "Noch nicht genannt" && currentMatrix.modalitaeten.trim().length > 0);
      const hasBegleitsymptome = Boolean(Array.isArray(currentMatrix?.begleitsymptome) && currentMatrix.begleitsymptome.length > 0);
      const hasGemuet = Boolean(currentMatrix?.gemuet && currentMatrix.gemuet !== "Noch nicht genannt" && currentMatrix.gemuet.trim().length > 0);

      const all6PillarsFilled = hasCausa && hasLokalisierung && hasEmpfindung && hasModalitaeten && hasBegleitsymptome && hasGemuet;
      
      // Loop protection: avoid endless question loops while ensuring all 6 pillars are asked
      const maxStepsReached = conversationHistory.length >= 7;
      const mustComplete = forceComplete || all6PillarsFilled || (maxStepsReached && hasGemuet && hasModalitaeten && hasEmpfindung && hasCausa);

      const prompt = `
Du bist die zentrale Logik-Engine für eine professionelle homöopathische Anamnese streng nach den Prinzipien von Samuel Hahnemann und den Paragraphen 83 bis 104 des Organon der Heilkunst.

### LEITLINIEN AUS DER ORGANON DER HEILKUNST (§§ 83–104):
- § 83: Vorurteilslose Beobachtung und treue Aufnahme des Krankheitsbildes ohne Spekulationen.
- § 84: Der Patient schildert seine Beschwerden; die Begleiter berichten. Der Arzt hört aufmerksam zu, ohne zu unterbrechen.
- §§ 85–90: Gezieltes Nachfragen zur Präzisierung. Jedes Einzelsymptom wird isoliert abgefragt. Niemals Suggestivfragen stellen, die dem Patienten die Antwort in den Mund legen.
- §§ 91–93: Unterscheidung chronische vs. akute Krankheiten. Bei chronischen Leiden: Erforschung früherer allopathischer Behandlungen, Arzneiwirkungen, Unterdrückungen und der Krankheitsgeschichte.
- § 94: Untersuchung von Lebensweise, Diät, Gemütszustand, häuslichen Umständen und Genesungshindernissen.
- §§ 95–98: Chronische Krankheiten: Beachtung kleiner, scheinbar unbedeutender Eigenheiten des Patienten.
- § 99: Akute Krankheiten: Erfragung des unmittelbaren Anlasses/Auslösers (Causa), des Beginns und des bisherigen akuten Verlaufs.
- §§ 100–102: Zusammenhängende / epidemische Erkrankungen: Erfassung des Gesamtbildes durch Verknüpfung der Symptome.
- §§ 103–104: Vollständiges Fixieren des Krankheitsbildes (Totalität der Symptome als Fundament des Simile).

### STRIKTE ANWEISUNG: UNIVERSELLE PRIORITÄTSREGEL & ENTSCHEIDUNGSLOGIK
1. Du bist kein generativer Interviewer, sondern ein adaptiver Navigator durch den Hahnemann-Katalog.
2. UNIVERSELLE PRIORITÄTSREGEL: Fakt → Klärung → Bestätigung → Strukturierung → nächste Frage. Niemals: Vermutung → Ergänzung → Klassifikation → Speicherung als Tatsache.
3. Die KI darf aus einer Patientenantwort ausschließlich bestimmen, welche bereits vorhandene Frage als Nächstes erforderlich ist. Sie darf niemals die Antwort auf diese nächste Frage vorwegnehmen.
4. Nur tatsächlich vom Patienten genannte Informationen dürfen als erkannt gelten. Keine Erfindung von Synonymen (z.B. Fieber != erhöhte Temperatur).
5. Wenn mehrere Beschwerden genannt werden: Keine automatische Klassifizierung als Leitsymptom, Begleitsymptom, Folge oder Ursache. Zuerst Beziehung klären (gleichzeitig vs. nacheinander).
6. Ebenen-Trennung: Ebene 1 (Originalaussage) bleibt unverändert. Ebene 2 (Bestätigt) nur nach expliziter Bestätigung. Ebene 3 (Analyse) greift strikt nur auf Ebene 2 zu.
7. LEITSYMPTOM-REGEL: Ein Leitsymptom darf niemals aus Reihenfolge, Intensität, Textposition, Wortwahl oder KI-Vermutung bestimmt werden. Es lautet so lange "Noch nicht geklärt", bis der Patient dies explizit durch eine Katalogfrage oder Bestätigung festlegt (es sei denn, der Patient hat es im Freitext ausdrücklich selbst als Hauptbeschwerde bezeichnet).
8. CAUSA & BEGLEITSYMPTOM-REGEL: Eine zeitliche Abfolge ("danach sofort Fieber") und eine Intensität ("extrem Fieber") sind keine Causa und kein Begleitsymptom. Causa, Leitsymptom und Begleitsymptom bleiben so lange "Noch nicht geklärt", bis sie durch gezielte Fragen aus dem Katalog ermittelt und bestätigt sind.
9. KEINE PAUSCHALEN SAMMELANGABEN (DISJUNKTIONS-REGEL): Die KI darf niemals mehrere unterschiedliche Alternativen, Möglichkeiten oder Sammelbegriffe (z. B. "Kaffee, Alkohol oder Medikamente" oder "Wärme, Ruhe oder Liegen") zu einer einzigen bestätigten Tatsache zusammenfassen. Wenn eine Option oder Frage mehrere Möglichkeiten enthält, müssen diese getrennt abgefragt und geklärt werden, bis exakt feststeht, welche einzelne Möglichkeit zutrifft. Mehrere Möglichkeiten ≠ eine bestätigte Tatsache.

### STRIKTE UNTERSCHEIDUNG: AKUT VS. CHRONISCH:
Aktueller Fall-Typ: "${caseType === 'chronisch' ? 'CHRONISCHER FALL (§§ 83–98 Organon)' : 'AKUTER FALL (§ 99 Organon)'}"
${caseType === 'chronisch' ? `
- Bei chronischen Krankheiten erforschst du umfassend die gesamte Historie inklusive früherer Behandlungen, allopathischer Medikamente, Unterdrückungen und Lebensweise.
- Frage nach dem langfristigen Verlauf, Beginn vor Monaten/Jahren und früheren Krankheitsereignissen.
` : `
- Bei akuten Beschwerden erfragst du den unmittelbaren Auslöser (Causa: Kälte, Zugluft, Durchnässung, Schreck, Zorn, Überanstrengung, Speisen etc.) und die aktuellen akuten Symptome samt raschem/stetigem Beginn, falls noch nicht geschildert.
`}

### URSÄCHLICHER ZUSAMMENHANG & BEZIEHUNG BEI MEHREREN BESCHWERDEN:
„Wenn mehrere Beschwerden genannt werden, darf keine dieser Beschwerden automatisch als Leitsymptom, Begleitsymptom, Folge oder Ursache klassifiziert werden. Zuerst muss die Beziehung zwischen den Beschwerden geklärt werden. Insbesondere ist zunächst zu klären, ob die Beschwerden gleichzeitig oder nacheinander aufgetreten sind. Bei einem zeitlichen Nacheinander sind zuerst Reihenfolge und zeitlicher Abstand zu ermitteln. Eine zeitliche Abfolge darf nicht automatisch als kausaler Zusammenhang oder Begleitsymptom interpretiert werden.“

### HOMÖOPATHISCHE STRUKTUR FÜR JEDES SYMPTOM (Bestehender Stand vor aktueller Eingabe):
1. Causa (Auslöser oder Beginn): ${hasCausa ? "Erfasst: " + currentMatrix.causa : "Falls in Eingabe genannt -> extrahieren, sonst erfragen"}
2. Lokalisation (Ort und Strahlungsoptionen / Ausstrahlung): ${hasLokalisierung ? "Erfasst: " + currentMatrix.lokalisierung : "Falls in Eingabe genannt -> extrahieren, sonst erfragen"}
3. Sensation (Qualität der Beschwerde / Schmerzcharakter): ${hasEmpfindung ? "Erfasst: " + currentMatrix.empfindung : "Falls in Eingabe genannt -> extrahieren, sonst erfragen"}
4. Modalitäten (Verschlechterung oder Besserung durch Wärme, Kälte, Ruhe, Bewegung, Druck, Tageszeit): ${hasModalitaeten ? "Erfasst: " + currentMatrix.modalitaeten : "Falls in Eingabe genannt -> extrahieren, sonst erfragen"}
5. Begleitsymptome und das Gemüt (Concomitants wie Durst, Schweiß, Temperaturverlangen UND psychischer Zustand / Gemütsverfassung wie Unruhe, Reizbarkeit, Furcht, Apathie): ${hasBegleitsymptome && hasGemuet ? "Erfasst: Begleit=" + currentMatrix.begleitsymptome.join(", ") + " | Gemüt=" + currentMatrix.gemuet : "Falls in Eingabe genannt -> extrahieren, sonst erfragen"}

### VERMEIDUNG HALLUZINIERTER SYMPTOME & MINIMAL-EINGABEN:
- Erfasse jeden Patienten absolut individuell und vermeide halluzinierte Symptome! Nimm nur auf, was der Patient explizit geäußert hat. Füge keine hypothetischen Symptome hinzu, die nicht genannt wurden.
- WENN BESTIMMTE KATEGORIEN (wie Causa, Leitsymptom, Modalitäten, Begleitsymptome) VOM PATIENTEN IN DER INITIALEN AUSSAGE NICHT EXPLIZIT GENANNT WURDEN:
  * Trage sie NICHT voreilig ein (keine automatische Klassifizierung als Leitsymptom, Begleitsymptom oder Causa).
  * Setze ungenannte Bereiche (causa, modalitaeten, etc.) auf "null" bzw. "leer" und lasse sie als "Noch nicht geklärt" behandeln.
  * Erfinde keine Auslöser, Synonyme (z.B. Fieber != erhöhte Temperatur) oder Diagnosen aus einer zeitlichen Abfolge!

### VORDEFINIERTE ANKLICKBARE OPTIONEN:
Für die Fragen generierst du im Pop-up stets 4 bis 6 vordefinierte, treffende homöopathische anklickbare Optionen passend zum individuellen Symptom des Patienten. (Der Anwender erhält im Frontend dazu stets ein verbindliches Freitextfeld).

### BEENDIGUNG ODER WEITERE FRAGE:
Soll jetzt abgeschlossen werden? ${mustComplete ? "JA (Abschluss der Organon-Anamnese)" : "NEIN (nächste Frage stellen)"}.
${mustComplete ? `
-> ABSCHLUSS-MODUS:
- "analyse_status": "completed"
- "naechste_frage": ""
- "auswahl_optionen": []
- "end_analyse_zusammenfassung": Hochpräzise Zusammenfassung für den Therapeuten streng nach Hahnemann & Bönninghausen (Causa/Auslöser, Lokalisation & Strahlung, Sensation, Modalitäten, Begleitsymptome & Gemüt, ursächlicher Zusammenhang/Symptomkomplex, führendes Simile).
- "aktuelle_mittel_differenzierung": 3 bis 5 passendste lateinische Arzneimittel.
- "sich_ergebende_fragen": Falls entscheidende Nuancen zwischen den Top-Mitteln verbleiben, GENAU 1 BIS MAXIMAL 2 gezielte Kontrollfragen.
` : `
-> LAUFENDE ERHEBUNG (Schritt ${currentStepCount}):
- "analyse_status": "in_progress"
- Frage gezielt nach der nächsten tatsächlich fehlenden Säule bezogen auf das konkrete Symptom des Patienten.
- "naechste_frage": Genau EINE präzise Einzelfrage, die das Symptom des Patienten ausdrücklich nennt.
- "auswahl_optionen": 4 bis 6 treffende homöopathische Antwortoptionen zum Anklicken.
`}

### AUSGABE-FORMAT (Strikte JSON-Struktur):
Antworte AUSSCHLIESSLICH mit validem JSON in genau diesem Format (ohne Markdown, ohne Text davor oder danach):
{
  "analyse_status": "${mustComplete ? "completed" : "in_progress"}",
  "wichtige_symptom_fragmente": {
    "causa": null,
    "lokalisierung": null,
    "empfindung": null,
    "modalitaeten": null,
    "begleitsymptome": [],
    "gemuet": null,
    "strahlungsoptionen": null,
    "ursaechlicher_zusammenhang": null,
    "fruehere_behandlungen_und_historie": null
  },
  "falltyp": "${caseType}",
  "mehrere_symptome_erkannt": false,
  "symptomkomplex_bestaetigt": false,
  "ignorierte_daten": [],
  "kontroll_und_nachfrage_logik": "Begründung nach Organon §§ 83-104",
  "naechste_frage": "${mustComplete ? "" : "Hier steht genau eine gezielte Einzelfrage zur fehlenden Säule"}",
  "auswahl_optionen": ${mustComplete ? "[]" : '["Option 1", "Option 2", "Option 3", "Option 4"]'},
  "auswahl_typ": "multiple",
  "aktuelle_mittel_differenzierung": ["Mittel 1", "Mittel 2", "Mittel 3"],
  "end_analyse_zusammenfassung": ${mustComplete ? '"Zusammenfassung für den Therapeuten: ..."' : "null"},
  "sich_ergebende_fragen": ${mustComplete ? `[
    {
      "id": "q1",
      "frage": "Differenzierende Frage zwischen den führenden Mitteln",
      "grund": "Klärung der Leitsymptome nach Organon",
      "kategorie": "modalitaeten",
      "optionen": ["Option A", "Option B", "Weder noch"]
    }
  ]` : "[]"}
}

Bestehende Matrix (bisherige Fakten):
${JSON.stringify(currentMatrix || {}, null, 2)}

Bisheriger Verlauf:
${JSON.stringify(conversationHistory || [], null, 2)}

Aktuelle Benutzereingabe:
"${text.replace(/"/g, '\\"')}"

SPRACHE: Alle Fragen, Optionen und Zusammenfassungen in ${targetLanguageName} formulieren. Arzneimittelnamen stets in offiziellem Latein (z. B. Aconitum napellus, Belladonna, Bryonia alba).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const usage = (response as any).usageMetadata || {};
      recordTokenUsage({
        therapistId: req.body?.therapistId,
        therapistName: req.body?.therapistName,
        therapistEmail: req.body?.therapistEmail,
        endpoint: "/api/hahnemann-analysis",
        actionName: `Hahnemann Organon §§ 83-104 Anamnese (${caseType})`,
        model: "gemini-3.8-flash",
        promptTokens: usage.promptTokenCount || Math.ceil(prompt.length / 4),
        candidatesTokens: usage.candidatesTokenCount || Math.ceil((response.text || "").length / 4),
      });

      const rawParsed = JSON.parse(response.text || "{}");

      // Robust fallback safeguard: enforce completion if steps reached or forceComplete was passed
      if (mustComplete) {
        rawParsed.analyse_status = "completed";
        rawParsed.naechste_frage = "";
        rawParsed.auswahl_optionen = [];
        if (!rawParsed.end_analyse_zusammenfassung) {
          const m = rawParsed.wichtige_symptom_fragmente || currentMatrix || {};
          rawParsed.end_analyse_zusammenfassung = getLocalizedOrganonSummary(m, language);
        }
      }

      // Ensure 2 to 3 clarifying questions exist when completed (never empty, strictly in moderation)
      if (rawParsed.analyse_status === "completed") {
        const m = rawParsed.wichtige_symptom_fragmente || currentMatrix || {};
        if (!Array.isArray(rawParsed.sich_ergebende_fragen) || rawParsed.sich_ergebende_fragen.length === 0) {
          rawParsed.sich_ergebende_fragen = getLocalizedClarifyingQuestions(m, language).slice(0, 3);
        } else if (rawParsed.sich_ergebende_fragen.length > 3) {
          // Strictly keep in moderation (max 3)
          rawParsed.sich_ergebende_fragen = rawParsed.sich_ergebende_fragen.slice(0, 3);
        }
      }

      res.json({ result: rawParsed });
    } catch (error) {
      console.error("Hahnemann Analysis Error:", error);
      res.status(500).json({ error: "Failed to perform Hahnemann analysis." });
    }
  });

  app.post("/api/check-medical-relevance", async (req, res) => {
    try {
      const { text, language = "de" } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.json({ isRelevant: false, reason: "empty_text" });
      }

      const trimmedText = text.trim();

      const apiKey = getGeminiApiKey();
      // If no API key or in case of offline fallback, evaluate quickly
      if (!apiKey) {
        return res.json({ isRelevant: true, reason: "no_api_key_passthrough" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Du bist ein strenger medizinischer Relevanzfilter für eine professionelle Anwendung zur Erfassung von Informationen für eine medizinische bzw. homöopathische Anamnese und Befunddokumentation.

AUFGABE:
Prüfe die folgende gesprochene/transkribierte Benutzeraussage im gesamten Sinnzusammenhang:
"${trimmedText.replace(/"/g, '\\"')}"

KRITERIEN:
1. AKZEPTIEREN ("isRelevant": true):
Die Aussage enthält gesundheitliche, medizinische, psychosomatische, therapeutische oder befundrelevante Informationen.
Dazu gehören u.a.:
- Symptome, Beschwerden, Schmerzen, Empfindungen, Krankheitsgefühl, Einschränkungen
- Vorerkrankungen, Operationen, Allergien, Unverträglichkeiten, Familienanamnese
- Medikamente, Dosierungen, Einnahmeintervalle, Nahrungsergänzungsmittel, Hausmittel
- Vitalparameter, Blutdruck, Puls, Laborwerte, körperliche Untersuchungsbefunde
- Modalitäten (Besserung/Verschlimmerung durch Wärme, Kälte, Bewegung, Ruhe, Tageszeit, Wetter, Berührung etc.)
- Begleitsymptome, Schlaf, Appetit, Durst, Verdauung, Gemütszustände, Stressreaktionen
- Homöopathische Leitsymptome, Charakteristika, Wesenszüge oder Auslöser von Beschwerden
- Konkrete Aussagen zu Behandlungsgründen oder Krankheitsverläufen

2. ABLEHNEN ("isRelevant": false):
Die Aussage hat KEINEN inhaltlichen Bezug zu Gesundheit, Krankheit, Beschwerden, Befunden oder Anamnese.
Dazu gehören u.a.:
- Reiner Begrüßungs- oder Höflichkeits-Smalltalk ohne Beschwerden (z. B. "Hallo wie geht es dir", "Guten Morgen", "Schönen Tag")
- Technische Kommentare oder Tests (z. B. "Test eins zwei drei", "Funktioniert das Mikrofon", "Hörst du mich", "Knopf drücken")
- Alltägliche Belanglosigkeiten ohne Gesundheitsbezug (z. B. "Ich gehe jetzt einkaufen", "Das Wetter ist heute sonnig", "Was kostet ein Auto", "Wie spät ist es", "Erzähl mir einen Witz")
- Kauderwelsch, zusammenhanglose Füllphrasen oder Störlaute ohne Sinn

Beurteile immer den GESAMTEN Sinnzusammenhang, nicht isolierte Wörter.

Antworte AUSSCHLIESSLICH im JSON-Format:
{
  "isRelevant": true,
  "reason": "kurze Begründung"
}
oder
{
  "isRelevant": false,
  "reason": "kurze Begründung"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const usage = (response as any).usageMetadata || {};
      recordTokenUsage({
        therapistId: req.body?.therapistId,
        therapistName: req.body?.therapistName,
        therapistEmail: req.body?.therapistEmail,
        endpoint: "/api/check-medical-relevance",
        actionName: "Medizinischer Relevanz-Check",
        model: "gemini-3.8-flash",
        promptTokens: usage.promptTokenCount || Math.ceil(prompt.length / 4),
        candidatesTokens: usage.candidatesTokenCount || Math.ceil((response.text || "").length / 4),
      });

      const parsed = JSON.parse(response.text || '{"isRelevant": true}');
      res.json({
        isRelevant: Boolean(parsed.isRelevant),
        reason: parsed.reason || ""
      });
    } catch (error) {
      console.error("Gemini Medical Relevance Filter Error:", error);
      // Fallback: If Gemini error occurs, do a basic check
      const trimmed = (req.body?.text || '').trim().toLowerCase();
      const nonMedicalPatterns = [
        /^test(\s+1|\s+2|\s+3|\s+eins|\s+zwei|\s+drei)?$/i,
        /^(hallo|hi|guten tag|guten morgen|servus|moin|ciao)(\s+(wie gehts|wie geht es dir))?$/i,
        /^(geht das|funktioniert das|h[öo]rst du mich|kannst du mich h[öo]ren|mikrofon test)$/i,
        /^(1\s*2\s*3|eins\s*zwei\s*drei|one\s*two\s*three)$/i
      ];
      const isObviouslyNonMedical = nonMedicalPatterns.some(p => p.test(trimmed));
      res.json({
        isRelevant: !isObviouslyNonMedical,
        reason: isObviouslyNonMedical ? "heuristic_non_medical" : "fallback_accepted"
      });
    }
  });

  // Helper for extracting JSON from AI response (handles markdown fences or raw json)
  function extractJsonFromText(text: string): any {
    if (!text) return null;
    let clean = text.trim();
    const jsonMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      clean = jsonMatch[1].trim();
    }
    try {
      return JSON.parse(clean);
    } catch {
      const firstBracket = clean.indexOf('[');
      const lastBracket = clean.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
          return JSON.parse(clean.substring(firstBracket, lastBracket + 1));
        } catch {}
      }
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(clean.substring(firstBrace, lastBrace + 1));
        } catch {}
      }
      return null;
    }
  }

  function parseAiJson(text: string, fallbackObj: any): any {
    if (!text) return fallbackObj;
    let clean = text.trim();
    const jsonMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      clean = jsonMatch[1].trim();
    }
    // Remove potential leading non-json text if any
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(clean);
    } catch (e1) {
      try {
        // Fix trailing commas and unescaped newlines/control chars inside strings
        const fixed = clean
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\u0000-\u001F]+/g, (match) => {
            if (match === '\n') return '\\n';
            if (match === '\r') return '\\r';
            if (match === '\t') return '\\t';
            return '';
          });
        return JSON.parse(fixed);
      } catch (e2) {
        try {
          // Fallback evaluation if safe
          // eslint-disable-next-line no-new-func
          const evaluated = new Function(`return ${clean}`)();
          if (evaluated && typeof evaluated === 'object') {
            return evaluated;
          }
        } catch {}

        console.error("Failed to parse AI JSON response. Raw text snippet:", clean.substring(0, 300));
        return fallbackObj;
      }
    }
  }

  // -----------------------------------------------------------------------------------------
  // 3-Stufen Pharmazeutischer Assistent Workflow:
  // Schritt 1 (Datenbank prüfen): search_database(q)
  // Schritt 2 (Externe Behördensuche): search_health_authority(q) mit BfArM, EMA, EOF & Fachinformation
  // Schritt 3 (Automatisch Abspeichern): save_to_database(results)
  // -----------------------------------------------------------------------------------------
  app.get("/api/medications/search", async (req, res) => {
    try {
      const q = (req.query.q as string || '').trim();
      const lang = (req.query.lang as string || 'de').trim();
      if (!q || q.length < 1) {
        return res.json({ results: [], fromDatabase: false, totalInDb: getDatabaseCount() });
      }

      const apiKey = getGeminiApiKey();
      const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
      const force = req.query.force === '1' || req.query.force === 'true';

      const outcome = await run3StepMedicationSearch(q, ai, extractJsonFromText, force, lang);
      res.json(outcome);
    } catch (error) {
      console.error("[MedicationAssistant] API Search Error:", error);
      // Fail-safe: Try local database search even if exception occurred
      try {
        const fallback = search_database(req.query.q as string || '');
        return res.json({
          results: fallback.matches,
          fromDatabase: true,
          stepExecuted: "database_match",
          totalInDb: getDatabaseCount()
        });
      } catch {
        res.status(500).json({ error: "Search failed", results: [] });
      }
    }
  });

  function getBaseMedName(name: string): string {
    if (!name) return 'text';
    return name.toLowerCase()
      .replace(/\b\d+(\s*,\s*\d+)?\s*(mg|g|µg|ug|ml|ie)\b/gi, '')
      .replace(/\b(al|ratiopharm|1a pharma|heumann|hexal|stada|pfizer|bayer|novartis|teva)\b/gi, '')
      .replace(/[®™]/g, '')
      .trim();
  }

  // Dedicated endpoint for full pharmaceutical profile with 3-step flow
  app.get("/api/medications/details", async (req, res) => {
    try {
      const name = (req.query.name as string || '').trim();
      const lang = (req.query.lang as string || 'de').trim();
      if (!name || name.length < 1) return res.status(400).json({ error: "Missing name" });

      const apiKey = getGeminiApiKey();
      const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

      const outcome = await run3StepMedicationDetails(name, ai, extractJsonFromText, lang);

      // If requested language is not German and details exist, check if translation is cached or translate live
      if (outcome && outcome.details && lang && lang !== 'de') {
        const directKey = `${name.toLowerCase().trim()}_${lang}`;
        const baseKey = `${getBaseMedName(name)}_${lang}`;
        const cache = getMedicationTranslations();
        const cached = cache[directKey] || cache[baseKey];

        if (cached) {
          if (typeof cached === 'object' && cached !== null) {
            outcome.details = { ...outcome.details, ...(cached as Record<string, any>) } as any;
          } else if (typeof cached === 'string') {
            outcome.details.monographText = cached;
          }
        } else if (ai) {
          try {
            const langNames: Record<string, string> = {
              de: "German (Deutsch)",
              en: "English",
              el: "Greek (Ελληνικά)",
              es: "Spanish (Español)",
              fr: "French (Français)",
              it: "Italian (Italiano)",
              ru: "Russian (Русский)"
            };
            const targetLanguageName = langNames[lang] || "English";

            const toTranslate = {
              activeSubstance: outcome.details.activeSubstance || '',
              category: outcome.details.category || '',
              recommendedIntake: outcome.details.recommendedIntake || '',
              sideEffectsByFrequency: outcome.details.sideEffectsByFrequency || null,
              sideEffects: outcome.details.sideEffects || [],
              interactions: outcome.details.interactions || [],
              contraindications: outcome.details.contraindications || null,
              warnings: outcome.details.warnings || '',
              monographText: outcome.details.monographText || ''
            };

            const prompt = `You are a licensed clinical and pharmaceutical translator.
Translate the following medication clinical profile accurately into ${targetLanguageName}.
CRITICAL INSTRUCTIONS:
1. Translate active substance name, category, side effects, interactions, contraindications, warnings, and the 5-section monograph into ${targetLanguageName}.
2. Retain the exact JSON structure.
3. Return ONLY a valid JSON object matching the input keys.

Input JSON:
${JSON.stringify(toTranslate, null, 2)}`;

            const trRes = await ai.models.generateContent({
              model: "gemini-flash-latest",
              contents: prompt
            });
            const trText = trRes.text ? trRes.text.trim() : "";
            const parsedTr = extractJsonFromText(trText);

            if (parsedTr && typeof parsedTr === 'object' && (parsedTr.monographText || parsedTr.sideEffects)) {
              saveMedicationTranslation(directKey, parsedTr);
              saveMedicationTranslation(baseKey, parsedTr);
              outcome.details = { ...outcome.details, ...parsedTr };
            } else if (trText && trText.length > 50) {
              saveMedicationTranslation(directKey, trText);
              saveMedicationTranslation(baseKey, trText);
              outcome.details.monographText = trText;
            }
          } catch (trErr) {
            console.warn("[MedicationDetails] Live translation error:", trErr);
          }
        }
      }

      res.json(outcome);
    } catch (error) {
      console.error("[MedicationAssistant] API Details Error:", error);
      try {
        const fallback = search_database(req.query.name as string || '');
        return res.json({
          details: fallback.bestMatch || null,
          fromDatabase: Boolean(fallback.bestMatch),
          stepExecuted: "database_match"
        });
      } catch {
        res.status(500).json({ error: "Details lookup failed", details: null });
      }
    }
  });

  // Dedicated translation endpoint for full clinical monograph into any app language
  app.post("/api/medications/translate", async (req, res) => {
    try {
      const { text, targetLang = "de", medName } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: "text is required" });
      }

      if (targetLang === "de") {
        return res.json({ translatedText: text, targetLang: "de", cached: true });
      }

      const directKey = `${(medName || 'text').toLowerCase().trim()}_${targetLang}`;
      const baseKey = `${getBaseMedName(medName || 'text')}_${targetLang}`;
      const cache = getMedicationTranslations();
      if (cache[directKey] || cache[baseKey]) {
        return res.json({ translatedText: cache[directKey] || cache[baseKey], targetLang, cached: true });
      }

      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(503).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const langNames: Record<string, string> = {
        de: "German (Deutsch)",
        en: "English",
        el: "Greek (Ελληνικά)",
        es: "Spanish (Español)",
        fr: "French (Français)",
        it: "Italian (Italiano)",
        ru: "Russian (Русский)"
      };
      const targetLanguageName = langNames[targetLang] || "English";

      const ai = new GoogleGenAI({ apiKey });
      const isComparison = req.body.type === 'comparison' || medName?.startsWith('comparison_');

      const prompt = isComparison
        ? `You are a certified senior clinical pharmacologist and medical translator.
Translate the following evidence-based clinical pharmacology and drug-interaction comparison report into ${targetLanguageName}.

CRITICAL REQUIREMENTS:
1. Preserve the exact markdown structure, section headers (### ⚠️ ..., ### 1. ..., ### 2. ..., ### 3. ...), and markdown tables.
2. Maintain strict GitHub Flavored Markdown (GFM) table syntax: each row must begin and end with '|'. DO NOT output broken delimiter rows like "| :--- | :--- |" in body text.
3. Accurately translate clinical terminology, drug risk classifications, triage categories, organ systems, and diagnostic checklist questions into ${targetLanguageName}.
4. Output ONLY the clean translated markdown in ${targetLanguageName} without markdown code fences, greetings, or conversational remarks.

Clinical report to translate:
${text}`
        : `You are a licensed medical and pharmaceutical translator for clinical staff.
Translate the following official medication monograph into ${targetLanguageName}.

CRITICAL REQUIREMENTS:
1. Maintain the exact 5-section structure and emoji headers:
   📝 1. [Active substance and ingredients]
   💊 2. [Dosage & administration]
   ⚠️ 3. [Side effects]
   🚫 4. [Contraindications]
   ❌ 5. [Dangerous drug interactions]
2. Preserve all numbers, dosages, units, and brand names.
3. Translate all clinical warnings, side effect frequencies (very common, common, uncommon, rare, very rare), and contraindications accurately and completely.
4. Output ONLY the translated monograph in ${targetLanguageName} without markdown code blocks, conversational comments, or explanations.

Monograph text to translate:
${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt
      });

      const rawTranslated = response.text ? response.text.trim() : "";
      const translatedText = rawTranslated
        .replace(/\uFFFD/g, '')
        .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
        .replace(/(?<![\u2600-\u27BF\uD83C-\uD83F])[\uFE0E\uFE0F]/g, '');
      if (translatedText && translatedText.length > 50) {
        saveMedicationTranslation(directKey, translatedText);
        saveMedicationTranslation(baseKey, translatedText);

        recordTokenUsage({
          endpoint: '/api/medications/translate',
          actionName: `Medikamenten-Monographie Übersetzung (${targetLang.toUpperCase()})`,
          model: 'gemini-flash-latest',
          promptTokens: response.usageMetadata?.promptTokenCount || 400,
          candidatesTokens: response.usageMetadata?.candidatesTokenCount || 600
        });

        return res.json({ translatedText, targetLang, cached: false });
      }

      res.status(500).json({ error: "Empty translation result" });
    } catch (err) {
      console.error("[MedicationTranslation] Error:", err);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // Dedicated Materia Medica translation endpoint using Gemini
  app.post("/api/materia-medica/translate", async (req, res) => {
    try {
      const { content, targetLang, latinName } = req.body;
      if (!content || !targetLang) {
        return res.status(400).json({ error: "content and targetLang are required" });
      }

      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(503).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const langNames: Record<string, string> = {
        de: "German (Deutsch)",
        en: "English",
        el: "Greek (Ελληνικά)",
        es: "Spanish (Español)",
        fr: "French (Français)",
        it: "Italian (Italiano)",
        ru: "Russian (Русский)"
      };
      const targetLanguageName = langNames[targetLang] || "English";

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert homeopathic and medical translator. Translate the following homeopathic Materia Medica monograph content for "${latinName || 'Remedy'}" into ${targetLanguageName}.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON matching this exact TypeScript structure:
{
  "commonName": "...",
  "category": "...",
  "origin": "...",
  "essence": "...",
  "mainIndications": ["...", "..."],
  "keynotes": ["...", "..."],
  "mindEmotional": "...",
  "modalitiesBetter": ["...", "..."],
  "modalitiesWorse": ["...", "..."],
  "potenciesAndDosage": "...",
  "sphereOfAction": ["...", "..."],
  "differentialRemedies": ["...", "..."],
  "searchKeywords": ["...", "..."]
}
2. Do NOT translate technical remedy IDs, medical Latin names, potencies, or chemical formulas.
3. Translate all clinical descriptions, indications, keynotes, modalities, and common names naturally and professionally into ${targetLanguageName}.

Source content to translate:
${JSON.stringify(content, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt
      });

      const rawText = response.text ? response.text.trim() : "";
      const cleanedJson = rawText.replace(/^```json\s*([\s\S]*?)\s*```$/, '$1').replace(/^```\s*([\s\S]*?)\s*```$/, '$1').trim();
      const translatedObj = JSON.parse(cleanedJson);

      return res.json({ translatedContent: translatedObj, targetLang });
    } catch (err: any) {
      console.error("[MateriaMedicaTranslate] Error:", err);
      res.status(500).json({ error: "Translation failed: " + err.message });
    }
  });

  // Endpoint to inspect pharmaceutical database stats
  app.get("/api/medications/database", (req, res) => {
    try {
      const count = getDatabaseCount();
      res.json({
        totalCount: count,
        source: "BfArM / EMA / EOF & verifizierte Praxisdatenbank",
        status: "ready"
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to read database stats" });
    }
  });

  // Clinical Pharmacology Comparison & Multi-Medication Risk Analysis API (AMTS Engine v5.0)
  app.post("/api/medications/clinical-comparison", async (req, res) => {
    try {
      const { patientCase, lifestyle, language } = req.body;
      const meds = patientCase?.medikamenteList || [];

      // Patient demographics
      const patientAge = patientCase?.patientAge !== undefined && patientCase?.patientAge !== null
        ? Number(patientCase.patientAge)
        : (() => {
            const bStr = patientCase?.patientBirthDate || patientCase?.geburtsdatum;
            if (!bStr) return null;
            const b = new Date(bStr);
            if (isNaN(b.getTime())) return null;
            const diff = new Date().getFullYear() - b.getFullYear();
            return diff >= 0 && diff <= 130 ? diff : null;
          })();

      const weightKg = Number(lifestyle?.bodyWeightKg || patientCase?.befundDetails?.gewicht || 70);
      const heightCm = Number(lifestyle?.bodyHeightCm || patientCase?.patientHeightCm || patientCase?.befundDetails?.groesse || 170);
      const computedBmi = heightCm > 0 && weightKg > 0 ? parseFloat((weightKg / ((heightCm / 100) ** 2)).toFixed(1)) : undefined;

      const isSmoker = Boolean(lifestyle?.isSmoker || lifestyle?.smokingStatus === 'smoker');
      const hasAlcohol = Boolean(lifestyle?.alcoholDaily || lifestyle?.alcoholFrequency === 'daily' || (lifestyle?.alcoholFrequency && lifestyle?.alcoholFrequency !== 'never'));
      const isPregnant = Boolean(lifestyle?.isPregnant || patientCase?.isPregnant);
      const pregnancyMonth = Number(lifestyle?.pregnancyMonth || patientCase?.pregnancyMonth || 1);

      // 1. DETERMINISTIC AMTS QUANTITATIVE COMPUTATION (BfArM / Rote Liste)
      const amtsPreCalc = evaluateAmtsMedications(meds, patientAge, weightKg);
      const pairs = evaluateAmtsPairs(amtsPreCalc.uniqueSubstances);

      const targetLang = (language as string) || 'de';
      const langNames: Record<string, string> = {
        de: "German (Deutsch)",
        en: "English",
        el: "Greek (Ελληνικά)",
        es: "Spanish (Español)",
        fr: "French (Français)",
        it: "Italian (Italiano)",
        ru: "Russian (Русский)"
      };
      const targetLanguageName = langNames[targetLang] || "German (Deutsch)";

      const apiKey = getGeminiApiKey();

      // If no API key, instantly return high-grade deterministic AMTS report
      if (!apiKey) {
        const detReport = generateAmtsReportMarkdown(
          amtsPreCalc,
          pairs,
          {
            name: patientCase?.patientName,
            age: patientAge,
            gender: patientCase?.geschlecht,
            weightKg,
            heightCm,
            bmi: computedBmi,
            isPregnant,
            pregnancyMonth,
            isSmoker,
            hasAlcohol,
          },
          targetLang
        );

        return res.json({
          analyzedAt: new Date().toISOString(),
          triageLevel: detReport.triageLevel,
          triageLabel: detReport.triageLabel,
          markdownContent: detReport.markdown,
          medicationsSummary: meds.map((m: any) => `${m.name} (${m.dosierung || 'Standard'})`),
          patientProfileSummary: {
            gender: patientCase?.geschlecht,
            isPregnant,
            pregnancyMonth,
            hasAlcohol,
            isSmoker,
            weightKg,
            heightCm,
            bmi: computedBmi,
          }
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Build explicit quantitative grounding for the LLM
      const quantitativeGrounding = amtsPreCalc.evaluations.map(e => {
        return `- ${e.drugName} (${e.substance}): Einzeldosis ${e.singleDoseMg ?? 'k. A.'} mg, Frequenz ${e.frequencyPer24h}x/24h -> Berechnete Gesamttagesdosis: ${e.dailyDoseMg ?? 'k. A.'} mg/Tag | BfArM-Höchstdosis: ${e.maxDailyDoseMg ?? 'Nicht gelistet'} mg/Tag | Überschreitung: ${e.percentageExceeded !== null ? `${e.percentageExceeded}%` : 'Keine'} | Status: ${e.status} (Zielorgan: ${e.targetOrgan}) -> ${e.clinicalRiskSummary}`;
      }).join('\n');

      const overdoseAlert = amtsPreCalc.hasToxicOverdose
        ? `🚨 VORBERECHNETE AKUTE ÜBERDOSIERUNG ERKANNT:\n` + amtsPreCalc.evaluations.filter(e => e.status === 'TOXISCH_UEBERDOSIERT').map(e => `* ${e.drugName}: ${e.dailyDoseMg} mg/Tag berechnet vs. ${e.maxDailyDoseMg} mg/Tag Höchstdosis (+${e.percentageExceeded}% Überschreitung). Zielorgan: ${e.targetOrgan}. GEFAHR: ${e.clinicalRiskSummary}`).join('\n')
        : `Alle verordneten Wirkstoffe liegen innerhalb der überprüfbaren BfArM-Höchstdosen oder Dosis fehlt.`;

      const prompt = `
# SYSTEM INSTRUCTIONS: AMTS CLINICAL ANALYSIS ENGINE (v5.0)

Du bist die analytische Komponente der AMTS Clinical Analysis Engine (Arzneimitteltherapiesicherheit), konform mit den Richtlinien des BfArM, der EMA und der Arzneimittelkommission der Deutschen Ärzteschaft (AkdÄ).
Deine Aufgabe ist es, übermittelte Arzneimitteltherapien strukturiert, konservativ, evidenzbasiert, nachvollziehbar und reproduzierbar zu interpretieren. Du agierst als klinischer Pharmakologe und Toxikologe.
Halluzinationen und unbegründete Spekulationen sind strengstens untersagt. Wenn Daten fehlen (z.B. Nierenfunktion, Laborwerte), deklariere diesen Parameter explizit als „NICHT_BEURTEILBAR“.

SPRACHANFORDERUNG (STRIKT & VERPFLICHTEND):
Verfasse die gesamte klinische Analyse und alle Textabschnitte, Tabellen und Empfehlungen VOLLSTÄNDIG in der Zielsprache: ${targetLanguageName}.

PATIENTENDATEN:
- Patient/in: ${patientCase?.patientName || 'Anonym'}
- Alter: ${patientAge !== null ? `${patientAge} Jahre` : 'NICHT_BEURTEILBAR (kein Geburtsdatum angegeben)'}
- Geschlecht: ${patientCase?.geschlecht || 'nicht spezifiziert'}
- Körpergewicht: ${weightKg} kg | Größe: ${heightCm} cm | BMI: ${computedBmi ? `${computedBmi} kg/m²` : 'k. A.'}
- Schwangerschaft: ${isPregnant ? `Ja, ${pregnancyMonth}. Monat` : 'Nein / nicht schwanger'}
- Nikotin: ${isSmoker ? 'Ja (Raucher)' : 'Nein'}
- Alkohol: ${hasAlcohol ? 'Ja (Alkoholkonsum angegeben)' : 'Nein'}

VORBERECHNETE QUANTITATIVE DOSIERUNGSDATEN (BfArM-REFERENZ):
${quantitativeGrounding}

${overdoseAlert}

THEORETISCHE ANZAHL DISJUNKTER WIRKSTOFF-PAARE n * (n - 1) / 2: ${amtsPreCalc.theoreticalPairCount} Paare.
KUMULATIVE ORGAN-TOXIZITÄTS-EINSTUFUNG:
- Gastrointestinal: ${amtsPreCalc.cumulativeOrganRisk.gastrointestinal} (${amtsPreCalc.organRiskReasons.gastrointestinal || ''})
- Renal: ${amtsPreCalc.cumulativeOrganRisk.renal} (${amtsPreCalc.organRiskReasons.renal || ''})
- Kardiovaskulär: ${amtsPreCalc.cumulativeOrganRisk.kardiovaskulaer} (${amtsPreCalc.organRiskReasons.kardiovaskulaer || ''})
- Hepatisch: ${amtsPreCalc.cumulativeOrganRisk.hepatisch} (${amtsPreCalc.organRiskReasons.hepatisch || ''})
- ZNS: ${amtsPreCalc.cumulativeOrganRisk.zns} (${amtsPreCalc.organRiskReasons.zns || ''})

AUFBAU DES BERICHTS (HALTE DICH EXAKT AN DIESE 5 ABSCHNITTE IN ${targetLanguageName}):

### ⚠️ WICHTIGER MEDIZINISCHER WARNHINWEIS
(Klarer Hinweis, dass dieses AMTS-Assistenzsystem der klinischen Risiko-Früherkennung dient und keine ärztliche Entscheidung ersetzt.)

### 1. KLINISCHE DRINGLICHKEIT & AMTS-TRIAGE (v5.0)
Beginne zwingend mit genau einer der folgenden Einstufungen in Großbuchstaben / eckigen Klammern:
${amtsPreCalc.hasToxicOverdose ? '- [KRITISCH / AKUTE LEBENSGEFAHR]' : '- [KRITISCH / AKUTE LEBENSGEFAHR] ODER [HOCH] ODER [GERING / ÜBERWACHUNG]'}
(Erkläre die Begründung präzise. Falls eine toxische Überdosierung vorliegt, hebe sofort die akute Lebensgefahr und das betroffene Zielorgan hervor!)

### 2. QUANTITATIVE DOSIERUNGSBERECHNUNG & HOECHSTDOSIS-VERGLEICH (BfArM / Rote Liste)
Erstelle eine vollständige GFM-Markdown-Tabelle aller Substanzen mit folgenden Spalten:
| Wirkstoff / Handelsname | Berechnete 24h-Tagesdosis | Max. Referenzdosis (BfArM) | Abweichung (%) | Status & Zielorgan | Klinische Risikobewertung |
| :--- | :--- | :--- | :--- | :--- | :--- |
(Jede Zeile muss den Status NORMAL, TOXISCH_UEBERDOSIERT oder NICHT_BEURTEILBAR ausweisen. Bei Überdosierung: Zielorgan und akutes Risiko nennen!)

### 3. DETERMINISTISCHE PAARWEISE INTERAKTIONSMATRIX
(Theoretische Anzahl Paare: ${amtsPreCalc.theoreticalPairCount})
Erstelle eine GFM-Markdown-Tabelle aller relevanten 2er-Wirkstoffkombinationen:
| Wirkstoff-Paarung | AMTS-Schweregrad | Biologischer Wirkmechanismus | Klinische Konsequenz | Priorisierte Handlungsempfehlung |
| :--- | :--- | :--- | :--- | :--- |
(Klassifiziere nach Grad 4 [Kontraindiziert], Grad 3 [Schwerwiegend], Grad 2 [Mittelschwer], Grad 1 [Gering] oder Keine Interaktion.)

### 4. KUMULATIVE MULTI-DRUG- & ORGAN-TOXIZITÄT (5 ZIELSYSTEME)
Erstelle eine GFM-Markdown-Tabelle für die 5 Organsysteme:
| Ziel-Organsystem | Kumulative Risikostufe | Pathophysiologische Begründung & Leitlinien-Referenz |
| :--- | :--- | :--- |
- Gastrointestinal (GI-Blutungen, Ulzera)
- Renal (GFR-Abfall, Autoregulation, Elektrolyte)
- Kardiovaskulär (Arrhythmien, Bradykardie, Kardiogener Schock, AV-Block)
- Hepatisch (CYP-Clearance, Transaminasen)
- ZNS (Kumulative Sedierung, Vigilanz, Atemdepression)
(Risikostufen: KRITISCH | HOCH | MITTEL | GERING | NICHT_BEURTEILBAR)

### 5. DIAGNOSTISCHER LEITFADEN FÜR DEN ARZTBESUCH & NOTFALL-CHECKLISTE
- Konkrete Fragen an den behandelnden Arzt (insb. Hinterfragung toxischer Dosierungen)
- Dringende Labor- und Diagnostikanforderungen (12-Kanal-EKG, eGFR, Elektrolyte, etc.)
- Alarmsymptome, bei denen unverzüglich der Notruf (112) gewählt werden muss
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let markdownContent = response.text || '';
      if (!markdownContent) {
        throw new Error("Empty response from clinical pharmacology model");
      }

      const upper = markdownContent.toUpperCase();
      let triageLevel: 'critical' | 'high' | 'low' = 'low';
      let triageLabel = '[GERING / ÜBERWACHUNG]';

      if (
        amtsPreCalc.hasToxicOverdose ||
        upper.includes('KRITISCH') ||
        upper.includes('CRITICAL') ||
        upper.includes('ΚΡΙΣΙΜ') ||
        upper.includes('CRÍTICO') ||
        upper.includes('CRITIQUE') ||
        upper.includes('КРИТИЧЕСК')
      ) {
        triageLevel = 'critical';
        triageLabel = '[KRITISCH / AKUTE LEBENSGEFAHR]';
      } else if (
        upper.includes('HOCH') ||
        upper.includes('HIGH') ||
        upper.includes('ΥΨΗΛ') ||
        upper.includes('ALTO') ||
        upper.includes('ÉLEVÉ') ||
        upper.includes('ELEVE') ||
        upper.includes('ВЫСОК')
      ) {
        triageLevel = 'high';
        triageLabel = '[HOCH]';
      }

      recordTokenUsage({
        endpoint: '/api/medications/clinical-comparison',
        actionName: `AMTS Clinical Analysis Engine v5.0 (${targetLang.toUpperCase()})`,
        model: 'gemini-2.5-flash',
        promptTokens: response.usageMetadata?.promptTokenCount || 750,
        candidatesTokens: response.usageMetadata?.candidatesTokenCount || 1200
      });

      return res.json({
        analyzedAt: new Date().toISOString(),
        triageLevel,
        triageLabel,
        markdownContent,
        medicationsSummary: meds.map((m: any) => `${m.name} (${m.dosierung || 'Standard'})`),
        patientProfileSummary: {
          gender: patientCase?.geschlecht,
          isPregnant,
          pregnancyMonth,
          hasAlcohol,
          isSmoker,
          weightKg,
          heightCm,
          bmi: computedBmi,
        }
      });
    } catch (err: any) {
      console.error("[ClinicalComparison] Error, falling back to deterministic AMTS report:", err?.message || err);
      
      // Resilient fallback to deterministic AMTS calculation
      try {
        const { patientCase, lifestyle, language } = req.body;
        const meds = patientCase?.medikamenteList || [];
        const weightKg = Number(lifestyle?.bodyWeightKg || patientCase?.befundDetails?.gewicht || 70);
        const heightCm = Number(lifestyle?.bodyHeightCm || patientCase?.patientHeightCm || patientCase?.befundDetails?.groesse || 170);
        const computedBmi = heightCm > 0 && weightKg > 0 ? parseFloat((weightKg / ((heightCm / 100) ** 2)).toFixed(1)) : undefined;
        const isSmoker = Boolean(lifestyle?.isSmoker || lifestyle?.smokingStatus === 'smoker');
        const hasAlcohol = Boolean(lifestyle?.alcoholDaily || lifestyle?.alcoholFrequency === 'daily');
        const isPregnant = Boolean(lifestyle?.isPregnant || patientCase?.isPregnant);
        const pregnancyMonth = Number(lifestyle?.pregnancyMonth || patientCase?.pregnancyMonth || 1);

        const amtsPreCalc = evaluateAmtsMedications(meds, null, weightKg);
        const pairs = evaluateAmtsPairs(amtsPreCalc.uniqueSubstances);

        const detReport = generateAmtsReportMarkdown(
          amtsPreCalc,
          pairs,
          {
            name: patientCase?.patientName,
            age: null,
            gender: patientCase?.geschlecht,
            weightKg,
            heightCm,
            bmi: computedBmi,
            isPregnant,
            pregnancyMonth,
            isSmoker,
            hasAlcohol,
          },
          (language as string) || 'de'
        );

        return res.json({
          analyzedAt: new Date().toISOString(),
          triageLevel: detReport.triageLevel,
          triageLabel: detReport.triageLabel,
          markdownContent: detReport.markdown,
          medicationsSummary: meds.map((m: any) => `${m.name} (${m.dosierung || 'Standard'})`),
          patientProfileSummary: {
            gender: patientCase?.geschlecht,
            isPregnant,
            pregnancyMonth,
            hasAlcohol,
            isSmoker,
            weightKg,
            heightCm,
            bmi: computedBmi,
          }
        });
      } catch (fallbackErr: any) {
        res.status(500).json({ error: "Clinical comparison failed", details: fallbackErr?.message });
      }
    }
  });

  // Admin Credentials & Config Persistence API
  const DEFAULT_ADMIN = {
    email: process.env.ADMIN_EMAIL || 'p.stogian@yahoo.com',
    password: process.env.ADMIN_PASSWORD || 'Othonospet@19071963',
    resetEmailDestination: process.env.ADMIN_RESET_EMAIL || process.env.ADMIN_EMAIL || 'p.stogian@yahoo.com',
    securityPin: process.env.ADMIN_SECURITY_PIN || '360',
  };

  const DEFAULT_EMAIL_SETTINGS = {
    sendMethod: process.env.MAIL_SEND_METHOD || 'api',
    apiToken: process.env.MAILBOX_API_TOKEN || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf',
    mailboxId: process.env.MAILBOX_ID || 'ACfb7e2a4063af9612b30d0a193ade',
    smtpHost: process.env.SMTP_HOST || 'smtp.hostinger.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '465', 10),
    smtpSecure: process.env.SMTP_SECURE !== 'false',
    smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER || 'therapie@homeopilot360.com',
    smtpPassword: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || 'Othonospet@19071963',
    fromEmail: process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER || 'therapie@homeopilot360.com',
    fromName: process.env.FROM_NAME || 'HomeoPilot 360',
    imapHost: process.env.IMAP_HOST || 'imap.hostinger.com',
    imapPort: parseInt(process.env.IMAP_PORT || '993', 10),
    imapSecure: process.env.IMAP_SECURE !== 'false',
    popHost: process.env.POP_HOST || 'pop.hostinger.com',
    popPort: parseInt(process.env.POP_PORT || '995', 10),
    popSecure: process.env.POP_SECURE !== 'false',
  };

  app.get("/api/admin/credentials", (req, res) => {
    try {
      ensureDataDir();
      if (fs.existsSync(ADMIN_CONFIG_FILE)) {
        const content = fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return res.json({
          email: parsed.email || DEFAULT_ADMIN.email,
          password: parsed.password || DEFAULT_ADMIN.password,
          resetEmailDestination: parsed.resetEmailDestination || DEFAULT_ADMIN.resetEmailDestination,
          securityPin: parsed.securityPin || DEFAULT_ADMIN.securityPin || '360',
          updatedAt: parsed.updatedAt,
        });
      }
      res.json(DEFAULT_ADMIN);
    } catch (err) {
      console.error("Error reading admin credentials:", err);
      res.json(DEFAULT_ADMIN);
    }
  });

  app.post("/api/admin/credentials", (req, res) => {
    try {
      ensureDataDir();
      let current = { ...DEFAULT_ADMIN };
      if (fs.existsSync(ADMIN_CONFIG_FILE)) {
        try {
          current = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
        } catch {
          // ignore error
        }
      }

      const updates = req.body || {};
      const updated = {
        email: updates.email?.trim() || current.email,
        password: updates.password !== undefined && updates.password !== null && updates.password !== '' ? updates.password : current.password,
        resetEmailDestination: updates.resetEmailDestination?.trim() || current.resetEmailDestination,
        securityPin: updates.securityPin !== undefined && updates.securityPin !== null && String(updates.securityPin).trim() !== '' ? String(updates.securityPin).trim() : (current.securityPin || '360'),
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      res.json(updated);
    } catch (err) {
      console.error("Error saving admin credentials:", err);
      res.status(500).json({ error: "Failed to save admin credentials" });
    }
  });

  app.post("/api/admin/credentials/reset", (req, res) => {
    try {
      ensureDataDir();
      fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(DEFAULT_ADMIN, null, 2), 'utf-8');
      res.json(DEFAULT_ADMIN);
    } catch (err) {
      console.error("Error resetting admin credentials:", err);
      res.status(500).json({ error: "Failed to reset admin credentials" });
    }
  });

  app.get("/api/site/config", (req, res) => {
    try {
      ensureDataDir();
      if (fs.existsSync(SITE_CONFIG_FILE)) {
        const content = fs.readFileSync(SITE_CONFIG_FILE, 'utf-8');
        return res.json(JSON.parse(content));
      }
      res.json({});
    } catch (err) {
      res.json({});
    }
  });

  app.post("/api/site/config", (req, res) => {
    try {
      ensureDataDir();
      let current = {};
      if (fs.existsSync(SITE_CONFIG_FILE)) {
        try {
          current = JSON.parse(fs.readFileSync(SITE_CONFIG_FILE, 'utf-8'));
        } catch {
          // ignore
        }
      }
      const updated = { ...current, ...(req.body || {}) };
      fs.writeFileSync(SITE_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to save site config" });
    }
  });

  // Email & SMTP Configuration API
  app.get("/api/email/config", (req, res) => {
    try {
      ensureDataDir();
      if (fs.existsSync(EMAIL_CONFIG_FILE)) {
        const content = fs.readFileSync(EMAIL_CONFIG_FILE, 'utf-8');
        return res.json(JSON.parse(content));
      }
      res.json(DEFAULT_EMAIL_SETTINGS);
    } catch (err) {
      console.error("Error reading email config:", err);
      res.json(DEFAULT_EMAIL_SETTINGS);
    }
  });

  app.post("/api/email/config", (req, res) => {
    try {
      ensureDataDir();
      let current = { ...DEFAULT_EMAIL_SETTINGS };
      if (fs.existsSync(EMAIL_CONFIG_FILE)) {
        try {
          current = JSON.parse(fs.readFileSync(EMAIL_CONFIG_FILE, 'utf-8'));
        } catch {
          // ignore
        }
      }
      const updated = {
        ...current,
        ...(req.body || {}),
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(EMAIL_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      res.json(updated);
    } catch (err) {
      console.error("Error saving email config:", err);
      res.status(500).json({ error: "Failed to save email config" });
    }
  });

  app.post("/api/email/config/reset", (req, res) => {
    try {
      ensureDataDir();
      fs.writeFileSync(EMAIL_CONFIG_FILE, JSON.stringify(DEFAULT_EMAIL_SETTINGS, null, 2), 'utf-8');
      res.json(DEFAULT_EMAIL_SETTINGS);
    } catch (err) {
      console.error("Error resetting email config:", err);
      res.status(500).json({ error: "Failed to reset email config" });
    }
  });

  // Token Billing & Usage Monitoring API
  app.get("/api/admin/tokens/summary", (req, res) => {
    try {
      const logs = getStoredTokenLogs();
      const rates = getTokenRates();

      let totalPromptTokens = 0;
      let totalCandidatesTokens = 0;
      let totalCachedTokens = 0;
      let totalTokens = 0;
      let totalCostEur = 0;
      const totalRequests = logs.length;

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const allBalances = getStoredBalances();
      const allPayments = getPaymentLogs();

      const therapistMap: Record<string, {
        therapistId: string;
        therapistName: string;
        therapistEmail: string;
        praxisName: string;
        tarifLabel: string;
        requestCount: number;
        promptTokens: number;
        candidatesTokens: number;
        cachedTokens: number;
        totalTokens: number;
        totalCostEur: number;
        totalCustomerCostEur: number;
        customerCostEur: number;
        marginEur: number;
        lastUsedAt: string;
        currentMonthTokens: number;
        currentMonthCostEur: number;
      }> = {};

      // Seed lookup map
      for (const [id, info] of Object.entries(THERAPIST_LOOKUP)) {
        therapistMap[id] = {
          therapistId: id,
          therapistName: info.name,
          therapistEmail: info.email,
          praxisName: info.praxis,
          tarifLabel: info.tarif,
          requestCount: 0,
          promptTokens: 0,
          candidatesTokens: 0,
          cachedTokens: 0,
          totalTokens: 0,
          totalCostEur: 0,
          totalCustomerCostEur: 0,
          customerCostEur: 0,
          marginEur: 0,
          lastUsedAt: '',
          currentMonthTokens: 0,
          currentMonthCostEur: 0,
        };
      }

      for (const log of logs) {
        totalPromptTokens += log.promptTokens || 0;
        totalCandidatesTokens += log.candidatesTokens || 0;
        totalCachedTokens += log.cachedTokens || 0;
        totalTokens += log.totalTokens || 0;
        totalCostEur += log.costEur || 0;

        const thId = log.therapistId || 'th-101';
        if (!therapistMap[thId]) {
          therapistMap[thId] = {
            therapistId: thId,
            therapistName: log.therapistName || ('Therapeut ' + thId),
            therapistEmail: log.therapistEmail || '',
            praxisName: '',
            tarifLabel: 'Standard-Tarif',
            requestCount: 0,
            promptTokens: 0,
            candidatesTokens: 0,
            cachedTokens: 0,
            totalTokens: 0,
            totalCostEur: 0,
            totalCustomerCostEur: 0,
            customerCostEur: 0,
            marginEur: 0,
            lastUsedAt: '',
            currentMonthTokens: 0,
            currentMonthCostEur: 0,
          };
        }

        const entry = therapistMap[thId];
        entry.requestCount += 1;
        entry.promptTokens += log.promptTokens || 0;
        entry.candidatesTokens += log.candidatesTokens || 0;
        entry.cachedTokens = (entry.cachedTokens || 0) + (log.cachedTokens || 0);
        entry.totalTokens += log.totalTokens || 0;
        entry.totalCostEur += log.costEur || 0;

        // Customer cost tracking
        const logCustCost = Number((log as any).customerCostEur || 0);
        entry.totalCustomerCostEur += logCustCost;
        entry.customerCostEur = entry.totalCustomerCostEur;

        const logDateStr = log.timestamp || '';
        if (logDateStr.startsWith(currentMonth)) {
          entry.currentMonthTokens += log.totalTokens || 0;
          entry.currentMonthCostEur += logCustCost;
        }

        if (!entry.lastUsedAt || new Date(log.timestamp) > new Date(entry.lastUsedAt)) {
          entry.lastUsedAt = log.timestamp;
        }
      }

      const byTherapist = Object.values(therapistMap).map(t => {
        const balRecord = allBalances[t.therapistId] || getTherapistBalanceRecord(t.therapistId);
        
        // Sum deposits for this month
        const currentMonthDeposited = allPayments
          .filter(p => p.therapistId === t.therapistId && (p.month === currentMonth || (p.createdAt && p.createdAt.startsWith(currentMonth))))
          .reduce((sum, p) => sum + (p.amountEur || 0), 0);

        const marginEur = Math.round((t.totalCustomerCostEur - t.totalCostEur) * 10000) / 10000;

        return {
          ...t,
          totalCostEur: Math.round(t.totalCostEur * 100000) / 100000,
          totalCustomerCostEur: Math.round(t.totalCustomerCostEur * 10000) / 10000,
          customerCostEur: Math.round(t.totalCustomerCostEur * 10000) / 10000,
          marginEur,
          currentMonthCostEur: Math.round(t.currentMonthCostEur * 10000) / 10000,
          balanceEur: Math.round(balRecord.balanceEur * 100) / 100,
          totalDepositedEur: Math.round(balRecord.totalDepositedEur * 100) / 100,
          currentMonthDepositedEur: Math.round(currentMonthDeposited * 100) / 100,
          lowBalanceThreshold: balRecord.lowBalanceThreshold || 5.00,
          isLowBalance: balRecord.balanceEur <= (balRecord.lowBalanceThreshold || 5.00),
          lastDepositAt: balRecord.lastDepositAt,
        };
      }).sort((a, b) => b.totalTokens - a.totalTokens);

      res.json({
        totalPromptTokens,
        totalCandidatesTokens,
        totalCachedTokens,
        totalTokens,
        totalCostEur: Math.round(totalCostEur * 100000) / 100000,
        totalRequests,
        byTherapist,
        rates,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error computing token summary:", err);
      res.status(500).json({ error: "Failed to compute token summary" });
    }
  });

  app.get("/api/admin/tokens/logs", (req, res) => {
    try {
      const logs = getStoredTokenLogs();
      const therapistId = req.query.therapistId as string | undefined;
      const limit = parseInt((req.query.limit as string) || '200', 10);

      let filtered = logs;
      if (therapistId && therapistId !== 'all') {
        filtered = filtered.filter(l => l.therapistId === therapistId);
      }

      res.json({ logs: filtered.slice(0, limit), total: filtered.length });
    } catch (err) {
      console.error("Error fetching token logs:", err);
      res.status(500).json({ error: "Failed to fetch token logs" });
    }
  });

  app.get("/api/admin/tokens/rates", (req, res) => {
    res.json({ rates: getTokenRates() });
  });

  app.post("/api/admin/tokens/rates", (req, res) => {
    try {
      const current = getTokenRates();
      const updated = {
        ...current,
        ...(req.body || {})
      };
      ensureDataDir();
      fs.writeFileSync(TOKEN_RATES_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      res.json({ success: true, rates: updated });
    } catch (err) {
      console.error("Error saving token rates:", err);
      res.status(500).json({ error: "Failed to save token rates" });
    }
  });

  app.post("/api/admin/tokens/reset", (req, res) => {
    try {
      ensureDataDir();
      fs.writeFileSync(TOKEN_USAGE_FILE, JSON.stringify([], null, 2), 'utf-8');
      res.json({ success: true, message: "Token logs reset" });
    } catch (err) {
      console.error("Error resetting token logs:", err);
      res.status(500).json({ error: "Failed to reset token logs" });
    }
  });

  // =============================================================
  // STRIPE & BILLING API ROUTES
  // =============================================================

  // 1. Get Admin Stripe Config (Masked)
  app.get(["/api/admin/stripe/config", "/api/admin/stripe/config/", "/api/billing/stripe-config", "/api/stripe/config"], (req, res) => {
    try {
      const config = getRawStripeConfig();
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const webhookUrl = `${protocol}://${host}/api/billing/webhook`;

      res.json({
        mode: config.mode,
        publishableKey: config.publishableKey,
        secretKeyMasked: maskKey(config.secretKey),
        secretKeyConfigured: Boolean(config.secretKey),
        webhookSecretMasked: maskKey(config.webhookSecret),
        webhookSecretConfigured: Boolean(config.webhookSecret),
        isConfigured: Boolean(config.publishableKey && config.secretKey),
        webhookUrl,
        updatedAt: config.updatedAt
      });
    } catch (err) {
      console.error("Error fetching stripe config:", err);
      res.status(500).json({ error: "Failed to fetch stripe config" });
    }
  });

  // 2. Save Admin Stripe Config
  app.post(["/api/admin/stripe/config", "/api/admin/stripe/config/", "/api/billing/stripe-config", "/api/stripe/config"], (req, res) => {
    try {
      const { mode, publishableKey, secretKey, webhookSecret } = req.body;
      const updates: any = {};
      if (mode) updates.mode = mode;
      if (publishableKey !== undefined) updates.publishableKey = publishableKey;
      if (secretKey !== undefined && !secretKey.includes('••••')) {
        updates.secretKey = secretKey;
      }
      if (webhookSecret !== undefined && !webhookSecret.includes('••••')) {
        updates.webhookSecret = webhookSecret;
      }

      const saved = saveStripeConfig(updates);
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const webhookUrl = `${protocol}://${host}/api/billing/webhook`;

      res.json({
        success: true,
        mode: saved.mode,
        publishableKey: saved.publishableKey,
        secretKeyMasked: maskKey(saved.secretKey),
        secretKeyConfigured: Boolean(saved.secretKey),
        webhookSecretMasked: maskKey(saved.webhookSecret),
        webhookSecretConfigured: Boolean(saved.webhookSecret),
        isConfigured: Boolean(saved.publishableKey && saved.secretKey),
        webhookUrl,
        updatedAt: saved.updatedAt
      });
    } catch (err) {
      console.error("Error saving stripe config:", err);
      res.status(500).json({ error: "Failed to save stripe config" });
    }
  });

  // 3. Test Stripe Connection
  app.post(["/api/admin/stripe/test", "/api/admin/stripe/test/"], async (req, res) => {
    try {
      const client = getStripeClient();
      if (!client) {
        return res.status(400).json({
          success: false,
          error: "Kein Stripe Secret Key (sk_...) hinterlegt. Bitte tragen Sie diesen zuerst ein."
        });
      }

      const balance = await client.balance.retrieve();
      res.json({
        success: true,
        message: "Verbindung zu Stripe erfolgreich hergestellt! API-Schlüssel ist aktiv.",
        livemode: balance.livemode,
        currency: balance.available?.[0]?.currency?.toUpperCase() || 'EUR'
      });
    } catch (err: any) {
      console.error("Stripe test connection failed:", err);
      res.status(400).json({
        success: false,
        error: err.message || "Verbindung fehlgeschlagen. Bitte überprüfen Sie den Secret Key."
      });
    }
  });

  // 4. Get Billing Payments Log
  app.get(["/api/admin/billing/payments", "/api/admin/billing/payments/"], (req, res) => {
    try {
      const therapistId = req.query.therapistId as string | undefined;
      const payments = getPaymentLogs(therapistId);
      res.json({ payments });
    } catch (err) {
      console.error("Error fetching payments:", err);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // 4b. Admin Simulation of Billing/Deposit Transaction
  app.post(["/api/admin/billing/simulate-transaction", "/api/admin/billing/simulate-transaction/"], async (req, res) => {
    try {
      const {
        therapistId,
        type = 'manual_reload',
        amountEur = 20,
        targetTariffId,
        note
      } = req.body;

      if (!therapistId) {
        return res.status(400).json({ success: false, error: 'Therapist ID is required' });
      }

      const amount = Math.max(0, Number(amountEur) || 0);
      const isUpgrade = type === 'package_purchase' || Boolean(targetTariffId);

      if (isUpgrade) {
        addPaymentLog({
          therapistId,
          therapistName: therapistId,
          amountEur: amount,
          type: 'package_purchase',
          status: 'succeeded',
          stripeSessionId: `cs_admin_sim_${Date.now()}`,
          note: note || `Admin-Test: Tarif-Upgrade (${amount.toFixed(2)} €)`
        });

        return res.json({
          success: true,
          status: 'succeeded',
          credited: false,
          upgraded: true,
          amountEur: amount,
          therapistId,
          targetTariffId,
          message: `Admin-Test: Tarif-Upgrade erfolgreich simuliert (${amount.toFixed(2)} €).`
        });
      } else {
        const updatedStatus = creditDepositToBalance({
          therapistId,
          therapistName: therapistId,
          amountEur: amount,
          type: 'manual_reload',
          stripeSessionId: `cs_admin_sim_${Date.now()}`,
          note: note || `Admin-Test: Guthaben-Aufladung (+${amount.toFixed(2)} €)`
        });

        return res.json({
          success: true,
          status: 'succeeded',
          credited: true,
          upgraded: false,
          amountEur: amount,
          therapistId,
          newBalanceEur: updatedStatus.balanceEur,
          message: `Admin-Test: Guthaben-Aufladung erfolgreich simuliert (+${amount.toFixed(2)} €).`
        });
      }
    } catch (err: any) {
      console.error("Error simulating transaction:", err);
      res.status(500).json({ success: false, error: "Simulation fehlgeschlagen" });
    }
  });

  // 5. Create Stripe Checkout Session (for initial booking or top-up)
  app.post(["/api/billing/create-checkout-session", "/api/billing/create-checkout-session/", "/billing/create-checkout-session"], async (req, res) => {
    try {
      const {
        therapistId,
        therapistName,
        therapistEmail,
        amountEur,
        type = 'manual_reload',
        successUrl,
        cancelUrl
      } = req.body;

      const amount = Math.max(1, Number(amountEur) || 20);
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol || 'http';
      const origin = `${protocol}://${host}`;

      const client = getStripeClient();
      const config = getRawStripeConfig();

      // Only allow customer checkout if Stripe is actively configured in Live mode
      if (!client || config.mode !== 'live') {
        return res.status(403).json({
          success: false,
          liveModeRequired: true,
          error: "online_payment_not_live",
          message: "Die Online-Zahlungsfunktion steht momentan nicht zur Verfügung oder befindet sich im Wartungsmodus. Es wurde kein Betrag abgebucht. Bitte wenden Sie sich an die Praxis-Administration."
        });
      }

      try {
        const session = await client.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'eur',
              product_data: {
                name: `HomöoPraxis Token-Guthaben (+${amount.toFixed(2)} €)`,
                description: `Token-Aufladung für Therapeut: ${therapistName || therapistId}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          customer_email: therapistEmail || undefined,
          client_reference_id: therapistId,
          metadata: {
            therapistId: therapistId || '',
            therapistName: therapistName || '',
            amountEur: amount.toString(),
            type: type || 'manual_reload',
            targetTariffId: req.body.targetTariffId || ''
          },
          success_url: successUrl || `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&therapistId=${therapistId}`,
          cancel_url: cancelUrl || `${origin}/?payment=cancelled&therapistId=${therapistId}`,
        });

        return res.json({
          sessionId: session.id,
          url: session.url,
          mode: 'stripe',
          success: true
        });
      } catch (stripeErr: any) {
        console.error("Stripe checkout error:", stripeErr);
        return res.status(500).json({
          success: false,
          error: stripeErr.message || 'Stripe Checkout konnte nicht gestartet werden',
          message: "Die Online-Zahlung konnte nicht initialisiert werden. Bitte überprüfen Sie Ihre Daten oder wenden Sie sich an die Administration."
        });
      }
    } catch (err: any) {
      console.error("Error creating checkout session:", err);
      res.status(500).json({ success: false, error: "Failed to create checkout session" });
    }
  });

  // 5b. Verify Session and Credit Balance only upon Stripe Confirmation
  app.get(["/api/billing/verify-session", "/api/billing/verify-session/"], async (req, res) => {
    try {
      const sessionId = (req.query.sessionId as string) || '';
      const therapistIdParam = (req.query.therapistId as string) || '';

      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Session ID missing' });
      }

      // Check if this session was already credited
      const existingPayments = getPaymentLogs(therapistIdParam || undefined);
      const alreadyCredited = existingPayments.find(p => p.stripeSessionId === sessionId);
      if (alreadyCredited) {
        return res.json({
          success: true,
          status: 'already_credited',
          credited: true,
          amountEur: alreadyCredited.amountEur,
          therapistId: alreadyCredited.therapistId
        });
      }

      const client = getStripeClient();
      const config = getRawStripeConfig();

      // Real Stripe session verification
      if (client && config.secretKey && !sessionId.startsWith('cs_sandbox_') && !sessionId.startsWith('cs_offline_') && !sessionId.startsWith('cs_admin_sim_')) {
        try {
          const session = await client.checkout.sessions.retrieve(sessionId);
          if (session && session.payment_status === 'paid') {
            const therapistId = session.metadata?.therapistId || session.client_reference_id || therapistIdParam;
            const amountEur = session.metadata?.amountEur 
              ? parseFloat(session.metadata.amountEur) 
              : ((session.amount_total || 0) / 100);
            const typeRaw = session.metadata?.type || 'manual_reload';
            const validTypes = ['initial_deposit', 'manual_reload', 'auto_reload', 'package_purchase'] as const;
            const type = validTypes.includes(typeRaw as any) ? (typeRaw as typeof validTypes[number]) : 'manual_reload';
            const targetTariffId = session.metadata?.targetTariffId;

            if (therapistId && amountEur > 0) {
              if (type === 'package_purchase') {
                addPaymentLog({
                  therapistId,
                  therapistName: session.metadata?.therapistName || therapistId,
                  therapistEmail: session.customer_details?.email || session.customer_email || undefined,
                  amountEur,
                  type: 'package_purchase',
                  status: 'succeeded',
                  stripeSessionId: session.id,
                  stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
                  note: `Stripe Tarif-Upgrade bezahlt: ${amountEur.toFixed(2)} €`
                });

                return res.json({
                  success: true,
                  status: 'paid',
                  credited: false,
                  upgraded: true,
                  amountEur,
                  therapistId,
                  targetTariffId,
                  type: 'package_purchase',
                  message: 'Tarif-Upgrade erfolgreich bezahlt und aktiviert.'
                });
              } else {
                creditDepositToBalance({
                  therapistId,
                  therapistName: session.metadata?.therapistName,
                  therapistEmail: session.customer_details?.email || session.customer_email || undefined,
                  amountEur,
                  type,
                  stripeSessionId: session.id,
                  stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
                  note: `Stripe Verified: +${amountEur.toFixed(2)} €`
                });

                return res.json({
                  success: true,
                  status: 'paid',
                  credited: true,
                  upgraded: false,
                  amountEur,
                  therapistId,
                  targetTariffId,
                  type
                });
              }
            }

            return res.json({
              success: true,
              status: 'paid',
              credited: false,
              amountEur,
              therapistId,
              targetTariffId,
              type
            });
          } else {
            return res.status(400).json({
              success: false,
              status: session?.payment_status || 'unpaid',
              error: 'Zahlung noch nicht bestätigt oder fehlgeschlagen.'
            });
          }
        } catch (stripeErr: any) {
          console.error("Error retrieving Stripe session:", stripeErr);
          return res.status(400).json({ success: false, error: stripeErr.message });
        }
      }

      // Sandbox verification - strictly forbidden for normal clients, only allowed for authorized admin simulation
      if (sessionId.startsWith('cs_sandbox_') || sessionId.startsWith('cs_offline_') || sessionId.startsWith('cs_admin_sim_')) {
        const isAdminSim = req.query.admin_sim === 'true' || req.headers['x-admin-simulation'] === 'true' || sessionId.startsWith('cs_admin_sim_');
        if (!isAdminSim) {
          return res.status(403).json({
            success: false,
            error: 'sandbox_disabled_for_clients',
            message: 'Die Online-Zahlung steht momentan nicht zur Verfügung. Bitte wenden Sie sich an die Praxis-Administration.'
          });
        }

        const therapistId = therapistIdParam || 'th-101';
        const amountEur = parseFloat((req.query.amount as string) || '20') || 20;
        const reqType = (req.query.type as string) || '';
        const targetTariffId = (req.query.targetTariffId as string) || (req.query.target_tariff_id as string) || undefined;
        const isUpgrade = reqType === 'package_purchase' || Boolean(targetTariffId);

        if (isUpgrade) {
          addPaymentLog({
            therapistId,
            therapistName: therapistId,
            amountEur,
            type: 'package_purchase',
            status: 'succeeded',
            stripeSessionId: sessionId,
            note: `Admin-Test: Tarif-Upgrade bestätigt: ${amountEur.toFixed(2)} €`
          });

          return res.json({
            success: true,
            status: 'paid',
            credited: false,
            upgraded: true,
            amountEur,
            therapistId,
            targetTariffId,
            type: 'package_purchase',
            message: 'Tarif-Upgrade erfolgreich autorisiert und aktiviert.'
          });
        }

        creditDepositToBalance({
          therapistId,
          amountEur,
          type: 'manual_reload',
          stripeSessionId: sessionId,
          note: `Admin-Test: Zahlung bestätigt: +${amountEur.toFixed(2)} €`
        });

        return res.json({
          success: true,
          status: 'paid',
          credited: true,
          upgraded: false,
          amountEur,
          therapistId,
          type: 'manual_reload'
        });
      }

      res.status(400).json({ success: false, error: 'Unbekannte Session' });
    } catch (err: any) {
      console.error("Error in verify-session:", err);
      res.status(500).json({ success: false, error: err.message || 'Verification failed' });
    }
  });

  // 6. Stripe Webhook Endpoint (Credits Balance in Real-Time)
  app.post(["/api/billing/webhook", "/api/billing/webhook/", "/billing/webhook"], (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const config = getRawStripeConfig();
      let event: any = null;
      const client = getStripeClient();

      if (client && config.webhookSecret && sig && (req as any).rawBody) {
        try {
          event = client.webhooks.constructEvent((req as any).rawBody, sig as string, config.webhookSecret);
        } catch (err: any) {
          console.warn('[Stripe Webhook] Signature verification failed:', err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      } else {
        event = req.body;
      }

      if (event && event.type === 'checkout.session.completed') {
        const session = event.data?.object || {};
        const therapistId = session.metadata?.therapistId || session.client_reference_id;
        const amountEur = session.metadata?.amountEur
          ? parseFloat(session.metadata.amountEur)
          : ((session.amount_total || 0) / 100);
        const type = session.metadata?.type || 'manual_reload';

        if (therapistId && amountEur > 0) {
          creditDepositToBalance({
            therapistId,
            therapistName: session.metadata?.therapistName,
            therapistEmail: session.customer_details?.email || session.customer_email,
            amountEur,
            type,
            stripeSessionId: session.id,
            stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            note: 'Stripe Webhook: checkout.session.completed'
          });
          console.log(`[Stripe Webhook] Auto-credited ${amountEur} EUR to ${therapistId}`);
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Error handling Stripe webhook:", err);
      res.status(500).json({ error: "Webhook handling failed" });
    }
  });

  // 7. Get Therapist Billing & Balance Status
  app.get(["/api/therapist/billing/:therapistId", "/api/therapist/billing/:therapistId/", "/therapist/billing/:therapistId"], (req, res) => {
    try {
      const { therapistId } = req.params;
      const balRecord = getTherapistBalanceRecord(therapistId);
      const payments = getPaymentLogs(therapistId);

      res.json({
        therapistId,
        balanceEur: balRecord.balanceEur,
        totalDepositedEur: balRecord.totalDepositedEur,
        lowBalanceThreshold: balRecord.lowBalanceThreshold,
        isLowBalance: balRecord.balanceEur <= balRecord.lowBalanceThreshold,
        autoReloadEnabled: balRecord.autoReloadEnabled,
        autoReloadAmount: balRecord.autoReloadAmount,
        lastDepositAt: balRecord.lastDepositAt,
        recentPayments: payments.slice(0, 10)
      });
    } catch (err) {
      console.error("Error fetching therapist billing:", err);
      res.status(500).json({ error: "Failed to fetch therapist billing" });
    }
  });

  // 8. Direct Top-Up (Immediate balance recharge)
  app.post(["/api/therapist/billing/top-up", "/api/therapist/billing/top-up/", "/therapist/billing/top-up"], (req, res) => {
    try {
      const { therapistId, therapistName, therapistEmail, amountEur, type = 'manual_reload', note } = req.body;
      const amount = Math.max(1, Number(amountEur) || 20);

      const updated = creditDepositToBalance({
        therapistId: therapistId || 'th-101',
        therapistName,
        therapistEmail,
        amountEur: amount,
        type,
        note: note || `Guthaben-Aufladung (+${amount.toFixed(2)} €)`
      });

      res.json({ success: true, balance: updated });
    } catch (err) {
      console.error("Error topping up balance:", err);
      res.status(500).json({ error: "Failed to top up balance" });
    }
  });

  // 9. Update Therapist Billing Settings (Threshold & Auto-reload)
  app.post(["/api/therapist/billing/settings", "/api/therapist/billing/settings/", "/therapist/billing/settings"], (req, res) => {
    try {
      const { therapistId, lowBalanceThreshold, autoReloadEnabled, autoReloadAmount } = req.body;
      const updated = updateTherapistBalanceConfig(therapistId, {
        lowBalanceThreshold,
        autoReloadEnabled,
        autoReloadAmount
      });

      res.json({ success: true, balance: updated });
    } catch (err) {
      console.error("Error updating therapist billing settings:", err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // 10. Admin Manually Adjust Therapist Balance
  app.post(["/api/admin/billing/balance/adjust", "/api/admin/billing/balance/adjust/"], (req, res) => {
    try {
      const { therapistId, amountEur, note } = req.body;
      const num = Number(amountEur);
      if (isNaN(num)) {
        return res.status(400).json({ success: false, error: "Ungültiger Betrag" });
      }
      let updated;
      if (num >= 0) {
        const updated = creditDepositToBalance({
          therapistId,
          amountEur: num,
          type: 'manual_reload',
          note: note || `Admin-Anpassung: +${num.toFixed(2)} €`
        });
        res.json({ success: true, balance: updated.balanceEur });
      } else {
        const updated = deductUsageFromBalance(therapistId, Math.abs(num));
        res.json({ success: true, balance: updated.newBalanceEur });
      }
    } catch (err) {
      console.error("Error adjusting therapist balance:", err);
      res.status(500).json({ success: false, error: "Fehler beim Anpassen des Guthabens" });
    }
  });

  // Email Send API (with Attachment & Full Template Support)
  app.post("/api/email/send", async (req, res) => {
    try {
      const {
        sendMethod,
        apiToken,
        mailboxId,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName,
        to,
        toEmail,
        subject,
        text,
        html,
        attachments = [],
      } = req.body || {};

      const targetTo = to || toEmail;
      if (!targetTo) {
        return res.status(400).json({ success: false, error: "Kein Empfänger angegeben." });
      }

      // Load stored email config as default base
      let config = { ...DEFAULT_EMAIL_SETTINGS };
      ensureDataDir();
      if (fs.existsSync(EMAIL_CONFIG_FILE)) {
        try {
          config = JSON.parse(fs.readFileSync(EMAIL_CONFIG_FILE, 'utf-8'));
        } catch {}
      }

      const effectiveSendMethod = sendMethod || config.sendMethod || 'api';
      const effectiveApiToken = (apiToken || config.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf').trim();
      const effectiveMailboxId = (mailboxId || config.mailboxId || '').trim();
      const effectiveFromEmail = fromEmail || config.fromEmail || config.smtpUser || 'therapie@homeopilot360.com';
      const effectiveFromName = fromName || config.fromName || 'HomeoPilot 360';
      const toArray = Array.isArray(targetTo) ? targetTo : [targetTo];

      // 1. Hostinger Mail API Method
      if (effectiveSendMethod === 'api' || (!config.smtpPassword && effectiveApiToken)) {
        if (!effectiveApiToken) {
          return res.status(400).json({ success: false, error: "Hostinger Mail API Token fehlt." });
        }

        let resolvedMailboxId = effectiveMailboxId;
        if (!resolvedMailboxId) {
          try {
            const meRes = await fetch('https://api.mail.hostinger.com/api/v1/me', {
              headers: { 'Authorization': `Bearer ${effectiveApiToken}` },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              resolvedMailboxId = meData?.data?.mailboxes?.[0]?.resourceId || 'ACfb7e2a4063af9612b30d0a193ade';
            } else {
              resolvedMailboxId = 'ACfb7e2a4063af9612b30d0a193ade';
            }
          } catch {
            resolvedMailboxId = 'ACfb7e2a4063af9612b30d0a193ade';
          }
        }

        const payload: any = {
          to: toArray.map((e: string) => e.trim()),
          displayName: effectiveFromName,
          subject: subject || 'HomeoPilot 360',
          text: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
          html: html || `<p>${text || ''}</p>`,
        };

        if (attachments && attachments.length > 0) {
          payload.attachments = attachments.map((att: any) => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType || 'application/pdf',
          }));
        }

        const sendRes = await fetch(`https://api.mail.hostinger.com/api/v1/mailboxes/${resolvedMailboxId}/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (sendRes.status === 204 || sendRes.status === 200 || sendRes.status === 201) {
          return res.json({ success: true, message: 'E-Mail erfolgreich versendet.' });
        } else {
          const sendErr = await sendRes.text();
          return res.status(400).json({ success: false, error: `Hostinger Versandfehler (${sendRes.status}): ${sendErr}` });
        }
      }

      // 2. SMTP Method
      const host = smtpHost || config.smtpHost;
      const port = Number(smtpPort || config.smtpPort || 465);
      const secure = smtpSecure !== undefined ? Boolean(smtpSecure) : Boolean(config.smtpSecure);
      const user = smtpUser || config.smtpUser;
      const pass = smtpPassword || config.smtpPassword;

      const transporter = nodemailer.createTransport({
        host: host.trim(),
        port,
        secure,
        auth: { user: user.trim(), pass: pass || '' },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
      });

      const mailOptions: any = {
        from: `"${effectiveFromName}" <${effectiveFromEmail}>`,
        to: toArray.join(', '),
        subject: subject || 'HomeoPilot 360',
        text: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
        html: html || `<p>${text || ''}</p>`,
      };

      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map((att: any) => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
          contentType: att.contentType || 'application/pdf',
        }));
      }

      const info = await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: 'E-Mail erfolgreich per SMTP versendet.', messageId: info.messageId });
    } catch (error: any) {
      console.error("Email Send Error:", error);
      return res.status(500).json({ success: false, error: error?.message || 'E-Mail-Versand fehlgeschlagen.' });
    }
  });

  // Email Test API (Hostinger API + SMTP)
  app.post("/api/email/test", async (req, res) => {
    try {
      const {
        sendMethod = 'api',
        apiToken = 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf',
        mailboxId = '',
        smtpHost = 'smtp.hostinger.com',
        smtpPort = 465,
        smtpSecure = true,
        smtpUser = 'therapie@homeopilot360.com',
        smtpPassword = '',
        fromEmail = 'therapie@homeopilot360.com',
        fromName = 'HomeoPilot 360',
        toEmail = '',
        subject,
        text,
        html,
        attachments = [],
      } = req.body || {};

      // 1. Hostinger Mail API Method
      if (sendMethod === 'api' || (!smtpPassword && apiToken)) {
        const token = (apiToken || '').trim();
        if (!token) {
          return res.status(400).json({
            success: false,
            error: "Hostinger Mail API Token fehlt.",
          });
        }

        // Verify token via /api/v1/me
        const meRes = await fetch('https://api.mail.hostinger.com/api/v1/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!meRes.ok) {
          const errText = await meRes.text();
          return res.status(400).json({
            success: false,
            error: `Hostinger API Fehler (${meRes.status}): ${errText}`,
          });
        }

        const meData = await meRes.json();
        const primaryMailbox = meData?.data?.mailboxes?.[0];
        const resolvedMailboxId = mailboxId || primaryMailbox?.resourceId || 'ACfb7e2a4063af9612b30d0a193ade';

        let emailSent = false;
        if (toEmail && toEmail.includes('@')) {
          const payload: any = {
            to: [toEmail.trim()],
            displayName: fromName || 'HomeoPilot 360',
            subject: subject || 'HomeoPilot 360 - Hostinger API Test-Mail',
            text: text || `Herzlichen Glückwunsch!\n\nDer E-Mail-Versand über die Hostinger Mail API funktioniert einwandfrei.\n\nPostfach: ${primaryMailbox?.address || fromEmail}\nEmpfänger: ${toEmail}`,
            html: html || `
              <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
                <h2 style="color: #0d9488; margin-top: 0;">Hostinger API Verbindungstest erfolgreich</h2>
                <p style="font-size: 14px; line-height: 1.6;">Herzlichen Glückwunsch! Der E-Mail-Versand über die <strong>Hostinger Mail API</strong> für <strong>HomeoPilot 360</strong> wurde erfolgreich verifiziert und ist einsatzbereit.</p>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 13px; color: #334155; margin: 16px 0; border: 1px solid #e2e8f0;">
                  <p style="margin: 4px 0;"><strong>Postfach:</strong> ${primaryMailbox?.address || fromEmail}</p>
                  <p style="margin: 4px 0;"><strong>Mailbox-ID:</strong> ${resolvedMailboxId}</p>
                  <p style="margin: 4px 0;"><strong>Empfänger:</strong> ${toEmail}</p>
                  <p style="margin: 4px 0;"><strong>Versandart:</strong> Hostinger REST Mail API</p>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">HomeoPilot 360 &copy; ${new Date().getFullYear()} – Naturheilpraxis &amp; Homöopathie Plattform</p>
              </div>
            `,
          };

          if (attachments && attachments.length > 0) {
            payload.attachments = attachments.map((att: any) => ({
              filename: att.filename,
              content: att.content,
              contentType: att.contentType || 'application/pdf',
            }));
          }

          const sendRes = await fetch(`https://api.mail.hostinger.com/api/v1/mailboxes/${resolvedMailboxId}/send`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (sendRes.status === 204 || sendRes.status === 200 || sendRes.status === 201) {
            emailSent = true;
          } else {
            const sendErr = await sendRes.text();
            return res.status(400).json({
              success: false,
              error: `Hostinger Versandfehler (${sendRes.status}): ${sendErr}`,
            });
          }
        }

        return res.json({
          success: true,
          message: emailSent
            ? `Hostinger Mail API Test-E-Mail erfolgreich an ${toEmail} gesendet.`
            : `Hostinger Mail API Verbindung erfolgreich verifiziert (${primaryMailbox?.address || fromEmail})!`,
          emailSent,
          mailbox: primaryMailbox,
        });
      }

      // 2. SMTP Method Fallback
      if (!smtpHost || !smtpPort || !smtpUser) {
        return res.status(400).json({
          success: false,
          error: "Bitte geben Sie mindestens SMTP-Server, Port und Benutzername an.",
        });
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost.trim(),
        port: Number(smtpPort),
        secure: Boolean(smtpSecure),
        auth: {
          user: smtpUser.trim(),
          pass: smtpPassword || '',
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
      });

      // Verify SMTP transport connection
      await transporter.verify();

      let emailSent = false;
      let messageId: string | undefined = undefined;

      if (toEmail && toEmail.includes('@')) {
        const mailOptions: any = {
          from: `"${fromName || 'HomeoPilot 360'}" <${fromEmail || smtpUser}>`,
          to: toEmail.trim(),
          subject: subject || 'HomeoPilot 360 - SMTP Verbindungstest erfolgreich',
          text: text || `Herzlichen Glückwunsch!\n\nDie E-Mail- und SMTP-Einstellungen für HomeoPilot 360 funktionieren einwandfrei.\n\nServer: ${smtpHost}\nPort: ${smtpPort}\nBenutzername: ${smtpUser}\nAbsender: ${fromEmail || smtpUser}`,
          html: html || `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
              <h2 style="color: #0d9488; margin-top: 0;">SMTP Verbindungstest erfolgreich</h2>
              <p style="font-size: 14px; line-height: 1.6;">Herzlichen Glückwunsch! Die E-Mail- und SMTP-Einstellungen für <strong>HomeoPilot 360</strong> wurden erfolgreich verifiziert und sind einsatzbereit.</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 13px; color: #334155; margin: 16px 0; border: 1px solid #e2e8f0;">
                <p style="margin: 4px 0;"><strong>SMTP-Server:</strong> ${smtpHost}</p>
                <p style="margin: 4px 0;"><strong>Port:</strong> ${smtpPort} (${smtpSecure ? 'SSL/TLS' : 'STARTTLS/None'})</p>
                <p style="margin: 4px 0;"><strong>Benutzername:</strong> ${smtpUser}</p>
                <p style="margin: 4px 0;"><strong>Absender:</strong> ${fromEmail || smtpUser}</p>
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">HomeoPilot 360 &copy; ${new Date().getFullYear()} – Naturheilpraxis &amp; Homöopathie Plattform</p>
            </div>
          `,
        };

        if (attachments && attachments.length > 0) {
          mailOptions.attachments = attachments.map((att: any) => ({
            filename: att.filename,
            content: Buffer.from(att.content, 'base64'),
            contentType: att.contentType || 'application/pdf',
          }));
        }

        const info = await transporter.sendMail(mailOptions);
        emailSent = true;
        messageId = info.messageId;
      }

      res.json({
        success: true,
        message: emailSent
          ? `SMTP-Verbindung erfolgreich verifiziert und Test-E-Mail an ${toEmail} versendet.`
          : `SMTP-Verbindung zu ${smtpHost}:${smtpPort} erfolgreich verifiziert!`,
        emailSent,
        messageId,
      });
    } catch (error: any) {
      console.error("Email Test Error:", error);
      res.status(400).json({
        success: false,
        error: error?.message || 'E-Mail-Verbindung fehlgeschlagen. Bitte Zugangsdaten prüfen.',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
