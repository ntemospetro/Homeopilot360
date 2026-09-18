export type UserRole = 'therapist' | 'admin' | 'guest';

export type TariffType = 'free_trial' | 'pro_unlimited' | string;

export type TariffBillingPeriod = 'free' | 'one_time' | 'monthly' | 'yearly';

export interface TariffPagePermissions {
  dashboard?: boolean;     // Dashboard / Startseite
  patients?: boolean;      // Kunden- / Patientenkartei
  cases?: boolean;         // Fallmanagement & Repertorisation
  quickintake?: boolean;   // Akutaufnahme & Schnellrepertorisation
  quickIntake?: boolean;   // Alias für quickintake
  materiamedica?: boolean; // Materia Medica
  materiaMedica?: boolean; // Alias für materiamedica
  repertorium?: boolean;   // Repertorium (Boericke / Kent)
  medications?: boolean;   // Medikamente & Arzneimittelrecherche
  documentation?: boolean; // Dokumentation / Anleitungen
  pdfExport?: boolean;     // PDF-Fallexport & Berichte
}

export interface TariffFeatureLimits {
  unlimitedAll?: boolean;              // Globaler Schalter: "Ohne Begrenzung für alle (Unbegrenzt)"
  maxPatients?: number;                // Maximale Kunden / Patienten (z.B. 3)
  unlimitedPatients?: boolean;         // Ohne Begrenzung für Kunden/Patienten
  maxCases?: number;                   // Maximale Fälle gesamt (z.B. 3)
  unlimitedCases?: boolean;            // Ohne Begrenzung für Fälle gesamt
  maxAnalysesPerCase?: number;         // Maximale Repertorisationen/Auswertungen pro Fall (z.B. 1)
  unlimitedAnalysesPerCase?: boolean;  // Ohne Begrenzung für Auswertungen pro Fall
  maxMedsPerCase?: number;             // Maximale Medikamente pro Kunde/Fall (z.B. 4)
  unlimitedMedsPerCase?: boolean;      // Ohne Begrenzung für Medikamente pro Fall
  maxMedsPerResearch?: number;         // Maximale Medikamente pro Recherche-Ergebnis (z.B. 4)
  unlimitedMedsPerResearch?: boolean;  // Ohne Begrenzung für Medikamente pro Recherche-Ergebnis
  maxMedResearch?: number;             // Maximale Medikamenten-Recherchen gesamt (z.B. 3)
  unlimitedMedResearch?: boolean;      // Ohne Begrenzung für Medikamenten-Recherchen
  maxMateriaMedicaSearch?: number;     // Maximale Materia Medica Arzneimittelsuchen gesamt (z.B. 3)
  unlimitedMateriaMedicaSearch?: boolean; // Ohne Begrenzung für Materia Medica Suchen
  maxRepertoriumSearch?: number;       // Maximale Suchen im Repertorium gesamt (z.B. 3)
  unlimitedRepertoriumSearch?: boolean; // Ohne Begrenzung für Repertorium Suchen
  maxRepertoriumSymptoms?: number;     // Maximale Symptome pro Repertorisation (z.B. 5)
  unlimitedRepertoriumSymptoms?: boolean; // Ohne Begrenzung für Symptome pro Repertorisation
  maxQuickIntake?: number;             // Maximale Akutaufnahmen gesamt (z.B. 3)
  unlimitedQuickIntake?: boolean;      // Ohne Begrenzung für Akutaufnahmen
  maxQuickIntakeSymptoms?: number;     // Maximale Symptome pro Akutaufnahme (z.B. 4)
  unlimitedQuickIntakeSymptoms?: boolean; // Ohne Begrenzung für Symptome pro Akutaufnahme
  maxRiskAnalyses?: number;            // Maximale Medikamenten-Risikoanalysen / Wechselwirkungs-Checks
  unlimitedRiskAnalyses?: boolean;     // Ohne Begrenzung für Risikoanalysen
  maxReports?: number;                 // Maximale PDF-Berichte & Dokumentations-Exporte
  unlimitedReports?: boolean;          // Ohne Begrenzung für Berichte
  maxAiRequests?: number;              // KI-Anfragen / Differenzialdiagnosen
  unlimitedAiRequests?: boolean;       // Ohne Begrenzung für KI-Anfragen
  maxAnalyses?: number;                // Backwards compatibility
  unlimitedAnalyses?: boolean;         // Backwards compatibility
}

export interface PackagePlan {
  id: string;
  name: string;
  price: number; // in EUR e.g. 0, 29, 49, 149
  currency: string; // e.g. '€'
  billingPeriod: TariffBillingPeriod;
  maxAnalyses: number; // e.g. 3, 10, 50, or 999999 for unlimited
  isUnlimited: boolean;
  initialBookingAmount?: number; // Initial booking/deposit amount e.g. 20, 50, 70 EUR
  lowBalanceThreshold?: number; // Low balance alert threshold e.g. 5, 10 EUR
  description?: string;
  features?: string[];
  badge?: string; // e.g. 'Test-Phase', 'Beliebt', 'Praxis-Tipp', 'Flatrate'
  isDefault?: boolean;
  isActive: boolean;
  createdAt: string;
  maxVoiceMainComplaintSeconds?: number; // e.g. 60, 120, 180, 300
  maxVoiceQuestionAnswerSeconds?: number; // e.g. 0, 30, 45, 60, 120
  allowVoiceQuestionAnswer?: boolean; // false if speech recording is not permitted for questions in this plan
  pagePermissions?: TariffPagePermissions;
  hiddenPages?: Record<string, boolean>;
  featureLimits?: TariffFeatureLimits;
}

export type LanguageCode = 'de' | 'en' | 'fr' | 'el' | 'it' | 'ru' | 'es';

export interface LanguageOption {
  code: LanguageCode;
  label: string; // German name e.g. "Deutsch"
  nativeName: string; // Native name e.g. "Ελληνικά"
  englishName: string; // English name
  flag: string; // Flag emoji
}

export interface ContactHistoryItem {
  value: string;
  changedAt: string;
  note?: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
  resetEmailDestination: string;
  securityPin?: string;
  updatedAt?: string;
}

export interface Therapist {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  password?: string;
  telefon: string;
  adresse: string;
  land: string;
  tarif: TariffType;
  tarifId?: string; // ID of the assigned PackagePlan
  tarifLabel: string;
  tarifPrice?: number;
  tarifPeriod?: TariffBillingPeriod;
  isUnlimited?: boolean;
  usedAnalyses: number;
  maxAnalyses: number; // default 3 for free_trial
  usedTokens?: number;
  maxTokens?: number; // default 25000 for free_trial limit
  featureUsage?: Record<string, number>; // e.g. { quick_intake: number, med_research: number, ... }
  registeredAt: string; // ISO date string
  status: 'active' | 'limit_reached' | 'locked' | 'upgraded';
  balanceEur?: number; // Current remaining token balance in EUR
  totalDepositedEur?: number; // Total amount deposited in EUR
  lowBalanceThreshold?: number; // Alert threshold in EUR (default from package, e.g. 5.00)
  autoReloadEnabled?: boolean;
  autoReloadAmount?: number;
  stripeCustomerId?: string;
  lastDepositAt?: string;
  praxisName?: string;
  professionalRole?: 'heilpraktiker' | 'arzt' | 'berater' | 'therapeut' | 'tierheilpraktiker';
  terminologyPreference?: 'klient' | 'patient';
  notes?: string;
  preferredLanguage?: LanguageCode;
  previousEmails?: ContactHistoryItem[];
  previousPhones?: ContactHistoryItem[];
  previousPraxisNames?: ContactHistoryItem[];
  previousAddresses?: ContactHistoryItem[];
  previousNames?: ContactHistoryItem[];
}

export interface PatientChild {
  id: string;
  name: string;
  age?: number;
  birthDate?: string;
  gender?: 'weiblich' | 'männlich' | 'divers';
}

export type QuestionType = 'scale' | 'choice' | 'multi_choice' | 'text';

export interface AnamnesisQuestion {
  id: string;
  complaintName?: string; // which complaint this question belongs to when multiple are detected
  complaintIndex?: number;
  category?: string; // e.g. 'Zeitverlauf & Beginn', 'Lokalisation & Ausstrahlung', 'Schmerzcharakter', 'Intensität & Skala', 'Episoden & Rhythmus', 'Begleitsymptome', 'Modalitäten'
  question: string;
  type: QuestionType;
  options?: string[]; // for choice or multi_choice
  scaleMin?: number; // 1
  scaleMax?: number; // 4
  scaleLabels?: { [key: number]: string }; // 1: 'Normal/Leicht', 2: 'Mäßig', 3: 'Stark', 4: 'Extrem'
  answerText?: string;
  answerScaleCurrent?: number; // 1 to 4 (scale currently/normally)
  answerScaleWorst?: number; // 1 to 4 (scale worst case)
  answerChoice?: string;
  answerMultiChoice?: string[];
  helpText?: string;
}

export interface PatientCase {
  id: string;
  therapistId: string;
  patientName: string;
  patientAge?: number;
  patientBirthDate?: string;
  patientGender?: 'weiblich' | 'männlich' | 'divers';
  patientWeightKg?: number;
  patientMaritalStatus?: 'ledig' | 'verheiratet' | 'in Partnerschaft' | 'geschieden' | 'getrennt lebend' | 'verwitwet' | 'sonstiges' | string;
  patientEmail?: string;
  patientPhone?: string;
  anamneseDatum: string;
  
  // Stammdaten Erweiterungen
  patientHeightCm?: number;
  isPregnant?: boolean;
  pregnancyMonth?: number;
  hasChildren?: boolean;
  childrenCount?: number;
  childrenList?: PatientChild[];
  customStammdaten?: { id: string; name: string; value: string }[];
  
  // Anamnese
  hauptbeschwerde: string;
  spontanbericht: string;
  
  // Dynamisch generierte Fragen zur Hauptbeschwerde
  anamnesisQuestions?: AnamnesisQuestion[];
  
  // Befund & Modalitäten
  modalitaetenBesser: string;
  modalitaetenSchlechter: string;
  gemuetPsyche: string;
  koerperAllgemein: string; // Schlaf, Appetit, Durst, Temperatur
  lokalsymptome: string;
  bisherigeMittel: string;
  extendedAnamnesis?: Record<string, any>;
  befundGewuenscht?: boolean;
  befundText?: string;
  befundDetails?: {
    gesamtbeurteilung?: string;
    blutdruck?: string;
    puls?: string;
    temperatur?: string;
    spo2?: string;
    gewicht?: string;
    groesse?: string;
    allgemeinzustand?: string;
    herzLunge?: string;
    abdomen?: string;
    hautSchleimhaeute?: string;
    neurologisch?: string;
    weitereBefunde?: string;
    customFelder?: { id: string; name: string; value: string }[];
  };
  nimmtMedikamente?: boolean;
  medikamenteList?: { 
    name: string; 
    dosierung: string; 
    einnahmeart: string;
    grund?: string;
    wirkstoff?: string;
    kategorie?: string;
    packungsgroessen?: string[];
    nebenwirkungenGegliedert?: {
      veryCommon?: string[];
      common?: string[];
      uncommon?: string[];
      rare?: string[];
      veryRare?: string[];
    };
    nebenwirkungen?: string[];
    wechselwirkungen?: string[];
    kontraindikationen?: {
      absolute?: string[];
      relative?: string[];
    };
    risiken?: string;
    monographText?: string;
    datenbankQuelle?: 'datenbank' | 'behoerden_recherche';
    authoritySource?: string;
  }[];
  
  // Analyse-Ergebnis
  analyzedAt?: string;
  remedySuggestions?: {
    name: string;
    potency: string;
    score: number;
    keyIndicators: string[];
    description: string;
  }[];
  analysisNotes?: string;
  clinicalAnalysis?: FullClinicalAnalysis;

  // Therapieempfehlungen & Verordnung (Schritt 8 / Empfehlungen)
  therapyRecommendations?: TherapyRecommendations;

  // Erste Medikation & Verlaufskontrollen
  initialPrescription?: InitialPrescription;
  followUps?: FollowUpEntry[];
  updatedAt?: string;

  // Repertorisation & Anamnese-Ergebnisse
  repertorisationErgebnis?: string;
  verordnungPotenz?: string;
  anamneseSymptome?: string;

  // Lebensstil & Kumulative Medikations-Risikoanalyse
  lifestyleData?: PatientLifestyleData;
  medicationRiskAnalysis?: MedicationRiskAnalysisResult;
}

export interface PatientLifestyleData {
  smokingStatus: 'non-smoker' | 'smoker' | 'former-smoker';
  cigarettesPerDay?: number;
  isSmoker?: boolean;
  alcoholFrequency: 'never' | 'rarely' | 'daily' | 'weekly' | 'monthly';
  alcoholBeverageType: 'beer' | 'wine' | 'spirits' | 'custom';
  alcoholAmount: number; // e.g. 1, 2, 4
  alcoholUnit: 'glasses' | 'bottles' | 'liters' | 'shots';
  alcoholVolumePercent: number; // e.g. 5 for beer, 12 for wine, 40 for spirits
  alcoholPureMgPerDay: number; // calculated pure alcohol in mg per day
  alcoholDaily?: boolean;
  alcoholSummaryText?: string;
  isPregnant?: boolean;
  pregnancyMonth?: number; // 1 - 9
  bodyWeightKg?: number; // e.g. 70
  bodyHeightCm?: number; // e.g. 175
  bmi?: number; // e.g. 22.9
}

export interface MedicationRiskAnalysisResult {
  analyzedAt: string;
  triageLevel: 'critical' | 'high' | 'low';
  triageLabel: string;
  markdownContent: string;
  medicationsSummary: string[];
  patientProfileSummary: {
    age?: number;
    gender?: string;
    weightKg?: number;
    heightCm?: number;
    bmi?: number;
    isPregnant?: boolean;
    pregnancyMonth?: number;
    smokingSummary?: string;
    alcoholPureMgPerDay?: number;
  };
}

export interface TherapyRemedyItem {
  id: string;
  name: string;
  potency: string; // e.g. "C30", "C200", "LM VI", "D12"
  tagesdosis: string; // e.g. "1 bis 2 Gaben à 3–5 Globuli"
  haeufigkeit: string; // e.g. "1- bis 2-mal täglich"
  anwendungsdauer: string; // e.g. "3 bis maximal 5 Tage"
  zeitraum: string; // e.g. "Akut- und Initialphase"
  therapistNotes?: string; // Textfeld für Anmerkungen / Einnahmehinweise des Therapeuten
  isSelected: boolean;
  isCustom?: boolean;
  score?: number;
  grade?: string;
}

export interface TherapyRecommendations {
  doctorConsultationRequired: boolean;
  doctorConsultationUrgency: 'Notfall' | 'Dringend' | 'Empfohlen' | 'Optional' | 'Keine' | string;
  doctorConsultationSpecialty: string;
  doctorConsultationReason: string;
  doctorConsultationNotes: string;
  remedies: TherapyRemedyItem[];
  generalTherapyNotes?: string;
  updatedAt?: string;
}

export interface InitialPrescription {
  remedy: string;
  potency?: string;
  dosage?: string;
  recommendations: string;
  prescribedAt?: string;
}

export interface FollowUpEntry {
  id: string;
  createdAt: string; // ISO datetime
  dateDisplay?: string; // e.g. "Montag, 10. August 2026, 21:37 Uhr"
  trend: 'Deutlich besser' | 'Leicht gebessert' | 'Unverändert' | 'Erstverschlimmerung' | 'Leicht verschlechtert' | 'Deutlich schlechter' | string;
  intensityPrevious: number; // 1 to 4
  intensityCurrent: number; // 1 to 4
  befindenVerlauf: string; // "Keine Beschwerden mehr. Hat aber Ausschlag."
  remedyRecommendations: string; // Folgeempfehlungen / Verordnung
  notes?: string;
}

export interface RedFlagItem {
  text: string;
  severity: 'WARNUNG' | 'HINWEIS' | 'AKUT';
  status?: 'vorhanden' | 'nicht vorhanden' | 'nicht angegeben';
  abklaerung?: string;
}

export interface DifferentialDiagnosisItem {
  id?: string;
  title: string;
  pro: string[];
  contra: string[];
  offeneFragen: string[];
  diagnostik?: string;
}

export interface MedicationAnalysisDetail {
  name: string;
  wirkstoff?: string;
  dosierung?: string;
  einnahme?: string;
  wirkung?: string;
  nebenwirkungen: string[];
  zusammenhaenge: string[];
  wechselwirkungen?: string[];
  risiken?: string;
  uebergebrauchBeurteilung?: string;
}

export interface HomeoRemedyRecommendation {
  name: string;
  score?: number;
  passungSymptome: string[];
  modalitaeten: string[];
  contraNichtPassend?: string[];
  fehlendeInfos?: string[];
  rangBegruendung: string;
  dosierungPotenz: string;
  potenz?: string;
  tagesdosis?: string;
  haeufigkeit?: string;
  anwendungsdauer?: string;
  zeitraum?: string;
  einnahmehinweis?: string;
}

export interface FullClinicalAnalysis {
  symptomatik?: {
    leitsymptome: string[];
    begleitsymptome: string[];
    modalitaetenBesser: string[];
    modalitaetenSchlechter: string[];
    zeitverlauf: string[];
    psychischVegetativ: string[];
  };
  redFlags: {
    warnings: RedFlagItem[];
    gesamtbewertung: string;
    empfohleneFachrichtung: string;
    dringlichkeit?: 'Sofortige medizinische Abklärung erforderlich' | 'Zeitnahe ärztliche Abklärung sinnvoll' | 'Kein akuter Warnhinweis anhand der vorliegenden Angaben' | string;
  };
  differentialdiagnostik: {
    dringlichkeitHeader?: string;
    items: DifferentialDiagnosisItem[];
  };
  arztfallEntscheidung?: {
    status: 'Ja' | 'Nein' | 'Nicht sicher beurteilbar';
    begruendung: string;
  };
  medikamente: {
    zusammenfassung: string;
    warnhinweis?: string;
    details: MedicationAnalysisDetail[];
    ibuprofenSpezifisch?: {
      dosierungEinnahme: string;
      wirkung: string;
      risiken: string[];
      uebergebrauch: string;
    };
  };
  fehlendeInformationen?: string[];
  homoeopathie: {
    summary?: string;
    symptomHierarchie?: {
      leitsymptome: string[];
      allgemeinsymptome: string[];
      gemuetsymptome: string[];
      lokalsymptome: string[];
      modalitaeten: string[];
      begleitsymptome: string[];
    };
    mittel: HomeoRemedyRecommendation[];
    trennung?: {
      medizinisch: string[];
      komplementaer: string[];
      homoeopathisch: string[];
    };
  };
  gesamtAuswertung?: {
    medizinischeEinschaetzung: string;
    dringlichkeit: string;
    medikamentenBewertung: string;
    redFlags: string;
    homoeopathie: string;
    naechsteSchritte: string[];
  };
}

export type ActiveView = 'landing' | 'register' | 'therapist' | 'admin' | 'organon';

export interface SiteConfig {
  logoUrl?: string;
  faviconUrl?: string;
}

export interface EmailConfig {
  sendMethod?: 'api' | 'smtp';
  apiToken?: string;
  mailboxId?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName?: string;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  popHost?: string;
  popPort?: number;
  popSecure?: boolean;
  updatedAt?: string;
}

export interface RegistrationTrialConfig {
  badge: string;
  priceDisplay: string;
  description: string;
  features: string[];
}

export type RegistrationTrialTranslations = Record<LanguageCode, RegistrationTrialConfig>;


export interface NameChangeRequest {
  id: string;
  therapistId: string;
  therapistEmail: string;
  oldVorname: string;
  oldNachname: string;
  requestedVorname: string;
  requestedNachname: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
}

export interface TermsPdfArchiveItem {
  id: string;
  versionGroup: string;
  version: string;
  title: string;
  lastUpdated: string;
  language: LanguageCode;
  createdAt: string;
  content: string;
  wordCount: number;
  sectionCount: number;
  pdfFilename?: string;
}

// ============================================================================
// HOMOEOPATHIC EXPERT 5-STEP REPERTORISATION & DECISION TREE TYPES
// ============================================================================

export interface BackendExtraktion {
  hauptbeschwerde: string; // [Leitsymptom]
  causa: string;           // [Causa] oder "Unbekannt (Bitte erfragen)"
  modalitaeten: string;    // [Modalitäten] oder "Unbekannt (Bitte erfragen)"
  begleitsymptome: string; // [Begleitsymptome] oder "Unbekannt (Bitte erfragen)"
}

export interface BackendAppLayoutDaten {
  optimales_simile: string; // Name des Hauptmittels oder "Fehlende Daten für Empfehlung"
  begruendung: string;      // Begründung oder Erklärung fehlender Daten
}

export interface BackendDiagnoseFragen {
  frage_1: string; // Gezielte Frage nach fehlender Modalität / Schmerzcharakter
  frage_2: string; // Gezielte Frage nach fehlendem Begleitsymptom / Gemütszustand
}

export interface BackendBaumstrukturPfad {
  bedingung: string;
  folge_frage: string;
  ergebnis_ja: string;
  ergebnis_nein: string;
}

export interface BackendBaumstrukturPopupDaten {
  start_knoten: string;
  haupt_differenzierungs_frage: string;
  pfad_ja: BackendBaumstrukturPfad;
  pfad_nein: BackendBaumstrukturPfad;
}

export interface HomeopathicExpertBackendOutput {
  extraktion: BackendExtraktion;
  app_layout_daten: BackendAppLayoutDaten;
  diagnose_fragen_fuer_therapeut: BackendDiagnoseFragen;
  baumstruktur_popup_daten: BackendBaumstrukturPopupDaten;
}

export interface HomeopathicExtractedAnalysis {
  hauptbeschwerde: string; // [Leitsymptom] Körperliche Hauptbeschwerde
  causa: string;           // [Causa] Auslöser/Ursache (Wetter, Emotion, Unfall, etc.)
  modalitaeten: string;    // [Modalitäten] Was verschlimmert (>) oder bessert (<)
  begleitsymptome: string; // [Begleitsymptome] Begleitsymptome & Gemütszustände
}

export interface DecisionTreeNodeRemedy {
  name: string;
  commonName?: string;
  latinName?: string;
  rationale: string;
}

export interface DecisionTreeSecondaryQuestion {
  question: string;
  option1Label: string;
  option1Remedy: DecisionTreeNodeRemedy;
  option2Label: string;
  option2Remedy: DecisionTreeNodeRemedy;
}

export interface DecisionTreeBranch {
  id: string;
  branchLabel: string;      // z.B. "[ VERDAUUNG / MAGEN ]"
  subQuestion: string;      // z.B. "Heißhunger auf Süßes? Blähbauch um 16-20 Uhr?"
  yesRemedy: DecisionTreeNodeRemedy;  // z.B. [LYCOPODIUM]
  noRemedy: DecisionTreeNodeRemedy;   // Lückenlos: Auffang-Mittel, z.B. [NUX VOMICA]
  secondaryQuestion?: DecisionTreeSecondaryQuestion;
}

export interface HomeopathicDecisionTree {
  header: string;           // z.B. "[ RECHTSEITIGE MIGRÄNE & VERSCHLIMMERUNG ~20 UHR ]"
  rootQuestion: string;     // z.B. "Gibt es begleitende Organ- oder Verdauungssymptome?"
  branches: DecisionTreeBranch[];
  textFlowchart: string;    // ASCII Flussdiagramm
}

export interface HomeopathicExpertResult {
  // Pure 5-step backend structured output
  extraktion: BackendExtraktion;
  app_layout_daten: BackendAppLayoutDaten;
  diagnose_fragen_fuer_therapeut: BackendDiagnoseFragen;
  baumstruktur_popup_daten: BackendBaumstrukturPopupDaten;

  // Normalized / compatibility fields
  extractedAnalysis: HomeopathicExtractedAnalysis;
  startPool?: string[];
  decisionTree: HomeopathicDecisionTree;
  diagnosticQuestions: string[];
  recommendedSimile: {
    remedyName: string;
    rationale: string;
  };
  formattedMarkdown?: string;
}

export type TrialLimitMode = 'analyses_only' | 'tokens_only' | 'both_whichever_first';

export interface FreeTrialLimitConfig {
  limitMode: TrialLimitMode;
  maxAnalyses: number;
  maxTokens: number;
}

export interface ModelPricingTier {
  modelId: string;
  modelName: string;
  purpose: string;
  // What I pay (Google API cost 2026)
  costInputPerMillionEur: number;
  costOutputPerMillionEur: number;
  costCachedPerMillionEur: number;
  // What I pay (Google API cost from 01.01.2027)
  costInput2027PerMillionEur: number;
  costOutput2027PerMillionEur: number;
  costCached2027PerMillionEur: number;
  // What customer pays
  customerInputPerMillionEur: number;
  customerOutputPerMillionEur: number;
  customerCachedPerMillionEur: number;
}

export interface TokenUsageRecord {
  id: string;
  timestamp: string;
  therapistId: string;
  therapistName?: string;
  therapistEmail?: string;
  endpoint: string;
  actionName: string;
  model: string;
  promptTokens: number;
  candidatesTokens: number;
  cachedTokens?: number;
  totalTokens: number;
  costEur: number;
  customerCostEur?: number;
}

export interface TherapistTokenSummary {
  therapistId: string;
  therapistName: string;
  therapistEmail: string;
  praxisName?: string;
  tarifLabel?: string;
  requestCount: number;
  promptTokens: number;
  candidatesTokens: number;
  cachedTokens?: number;
  totalTokens: number;
  totalCostEur: number;
  totalCustomerCostEur?: number;
  customerCostEur?: number;
  marginEur?: number;
  lastUsedAt: string;
  // Financial Reporting & Balance Fields
  balanceEur: number; // Remaining balance
  totalDepositedEur: number; // Lifetime total deposited
  currentMonthDepositedEur: number; // Deposited this calendar month
  currentMonthCostEur: number; // Consumed this calendar month (customer price)
  currentMonthTokens: number; // Tokens used this calendar month
  lowBalanceThreshold: number; // Configured alert threshold (e.g. 5.00 EUR)
  isLowBalance: boolean; // true if balanceEur <= lowBalanceThreshold
  lastDepositAt?: string;
}

export interface StripeConfig {
  mode: 'test' | 'live';
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  isConfigured: boolean;
  webhookUrl: string;
  updatedAt?: string;
}

export interface BillingDepositRecord {
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

export interface TokenPricingRates {
  inputPerMillionEur: number;
  outputPerMillionEur: number;
  cachedPerMillionEur?: number;
  currency: string;
  modelTiers?: ModelPricingTier[];
  freeTrialLimit?: FreeTrialLimitConfig;
}

export interface TokenBillingSummary {
  totalPromptTokens: number;
  totalCandidatesTokens: number;
  totalCachedTokens?: number;
  totalTokens: number;
  totalCostEur: number;
  totalCustomerCostEur?: number;
  totalMarginEur?: number;
  marginPercent?: number;
  totalRequests: number;
  byTherapist: TherapistTokenSummary[];
  rates: TokenPricingRates;
  lastUpdated: string;
}
