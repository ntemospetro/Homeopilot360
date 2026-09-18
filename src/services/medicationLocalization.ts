import { LanguageCode } from '../types';
import { getActiveTherapist } from './storage';

// In-memory cache for translated monographs
const translationCache = new Map<string, string>();

// Local storage key for persistent client cache
const CLIENT_TRANSLATION_STORAGE_KEY = 'homoeo_med_translations_v2';

// Clear old faulty cache
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('homoeo_med_translations_v1');
  }
} catch {}

function getStoredCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CLIENT_TRANSLATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStoredCache(key: string, value: string) {
  try {
    const cache = getStoredCache();
    cache[key] = value;
    localStorage.setItem(CLIENT_TRANSLATION_STORAGE_KEY, JSON.stringify(cache));
  } catch {}
}

export interface SectionHeaders {
  introTemplate: (name: string, active: string) => string;
  sec1: string;
  sec2: string;
  sec3: string;
  sec4: string;
  sec5: string;
  belongsToGroup: string;
  mainActive: string;
  dosageForms: string;
  excipients: string;
  dosagePrinciple: (name: string, active: string) => string;
  availableDosages: string;
  intakeRecommendation: string;
  elderlyWarning: string;
  frequencyVeryCommon: string;
  frequencyCommon: string;
  frequencyUncommon: string;
  frequencyRare: string;
  frequencyVeryRare: string;
  commonSideEffects: string;
  specialRisks: string;
  contraindicationsIntro: (name: string) => string;
  absoluteContraindications: string;
  relativeContraindications: string;
  officialContraindications: string;
  noContraindications: string;
  interactionsIntro: (name: string) => string;
  observeConcomitant: string;
  avoidAlcohol: string;
  noInteractions: string;
}

export const MONOGRAPH_SECTIONS_I18N: Record<LanguageCode, SectionHeaders> = {
  de: {
    introTemplate: (name, active) =>
      `Hier ist die komplette Übersicht zu ${name} (${active}) mit allen wichtigen Informationen zu Inhaltsstoffen, Dosierung, Nebenwirkungen, Kontraindikationen und Wechselwirkungen, übersichtlich für dich zusammengefasst.`,
    sec1: '📝 1. Wirkstoff und Inhaltsstoffe',
    sec2: '💊 2. Dosierung & Anwendung',
    sec3: '⚠️ 3. Nebenwirkungen',
    sec4: '🚫 4. Kontraindikationen (Gegenanzeigen)',
    sec5: '❌ 5. Gefährliche Wechselwirkungen',
    belongsToGroup: 'gehört zur Wirkstoffgruppe:',
    mainActive: 'Hauptwirkstoff:',
    dosageForms: 'Darreichungsformen:',
    excipients: 'Hilfsstoffe sind der jeweiligen herstellerspezifischen Packungsbeilage zu entnehmen.',
    dosagePrinciple: (name, active) =>
      `Die Dosierung von ${name} (${active}) wird von der behandelnden Ärztin oder dem Arzt streng individuell festgelegt. Es gilt der Grundsatz, das Medikament so niedrig dosiert und so kurz bzw. indikationsgerecht wie möglich anzuwenden, um Risiken zu minimieren.`,
    availableDosages: 'Verfügbare Dosierungsstärken:',
    intakeRecommendation: 'Einnahmeempfehlung:',
    elderlyWarning:
      'Ältere oder geschwächte Patienten: Bei älteren Personen oder Personen mit eingeschränkter Organfunktion (insb. Leber/Niere) ist eine engmaschige Dosisanpassung nach ärztlicher Rücksprache essenziell.',
    frequencyVeryCommon: 'Sehr häufig (≥ 1/10):',
    frequencyCommon: 'Häufig (≥ 1/100 bis < 1/10):',
    frequencyUncommon: 'Gelegentlich (≥ 1/1.000 bis < 1/100):',
    frequencyRare: 'Selten (≥ 1/10.000 bis < 1/1.000):',
    frequencyVeryRare: 'Sehr selten (< 1/10.000):',
    commonSideEffects: 'Häufige Begleiterscheinungen:',
    specialRisks: 'Besondere Risiken & Warnhinweise:',
    contraindicationsIntro: (name) =>
      `Unter bestimmten gesundheitlichen Bedingungen darf ${name} entweder gar nicht oder nur nach strenger ärztlicher Nutzen-Risiko-Abwägung angewendet werden.`,
    absoluteContraindications: 'Absolute Gegenanzeigen (Anwendung ausgeschlossen):',
    relativeContraindications: 'Relative Gegenanzeigen (Besondere Vorsicht erforderlich):',
    officialContraindications: 'Behördliche Gegenanzeigen & Vorsichtsmaßnahmen:',
    noContraindications: 'Keine gesonderten behördlichen Gegenanzeigen in den Daten hinterlegt.',
    interactionsIntro: (name) =>
      `Die Kombination von ${name} mit bestimmten anderen Substanzen kann die Wirkung unvorhersehbar verändern oder unerwünschte Reaktionen hervorrufen.`,
    observeConcomitant: 'Wechselwirkungen mit Begleitmedikation beachten.',
    avoidAlcohol: 'Alkohol meiden.',
    noInteractions: 'Keine spezifischen Wechselwirkungen in den behördlichen Daten hinterlegt.'
  },
  el: {
    introTemplate: (name, active) =>
      `Εδώ είναι η πλήρης επίσημη επισκόπηση για το ${name} (${active}) με όλες τις σημαντικές πληροφορίες σχετικά με τα συστατικά, τη δοσολογία, τις ανεπιθύμητες ενέργειες, τις αντενδείξεις και τις αλληλεπιδράσεις, συγκεντρωμένες συνοπτικά για εσάς.`,
    sec1: '📝 1. Δραστική ουσία και συστατικά',
    sec2: '💊 2. Δοσολογία & Χορήγηση',
    sec3: '⚠️ 3. Ανεπιθύμητες ενέργειες (Παρενέργειες)',
    sec4: '🚫 4. Αντενδείξεις',
    sec5: '❌ 5. Επικίνδυνες αλληλεπιδράσεις',
    belongsToGroup: 'ανήκει στην κατηγορία δραστικών ουσιών:',
    mainActive: 'Κύρια δραστική ουσία:',
    dosageForms: 'Μορφές χορήγησης:',
    excipients: 'Τα έκδοχα αναφέρονται στο αντίστοιχο φύλλο οδηγιών χρήσης του κατασκευαστή.',
    dosagePrinciple: (name, active) =>
      `Η δοσολογία του ${name} (${active}) καθορίζεται αυστηρά εξατομικευμένα από τον θεράποντα ιατρό. Ισχύει η βασική αρχή της χορήγησης της χαμηλότερης δυνατής αποτελεσματικής δόσης για το συντομότερο απαραίτητο διάστημα προς ελαχιστοποίηση των κινδύνων.`,
    availableDosages: 'Διαθέσιμες περιεκτικότητες δόσης:',
    intakeRecommendation: 'Σύσταση λήψης:',
    elderlyWarning:
      'Ηλικιωμένοι ή εξασθενημένοι ασθενείς: Σε ηλικιωμένους ή άτομα με μειωμένη ηπατική ή νεφρική λειτουργία, είναι απαραίτητη η στενή προσαρμογή της δόσης κατόπιν ιατρικής συνεννόησης.',
    frequencyVeryCommon: 'Πολύ συχνές (≥ 1/10):',
    frequencyCommon: 'Συχνές (≥ 1/100 έως < 1/10):',
    frequencyUncommon: 'Όχι συχνές (≥ 1/1.000 έως < 1/100):',
    frequencyRare: 'Σπάνιες (≥ 1/10.000 έως < 1/1.000):',
    frequencyVeryRare: 'Πολύ σπάνιες (< 1/10.000):',
    commonSideEffects: 'Συχνές εκδηλώσεις:',
    specialRisks: 'Ειδικοί κίνδυνοι & προειδοποιήσεις:',
    contraindicationsIntro: (name) =>
      `Υπό ορισμένες καταστάσεις υγείας, το ${name} είτε δεν επιτρέπεται να χρησιμοποιηθεί καθόλου είτε μόνο μετά από αυστηρή ιατρική εκτίμηση οφέλους-κινδύνου.`,
    absoluteContraindications: 'Απόλυτες αντενδείξεις (αποκλείεται η χρήση):',
    relativeContraindications: 'Σχετικές αντενδείξεις (απαιτείται ιδιαίτερη προσοχή):',
    officialContraindications: 'Επίσημες αντενδείξεις & μέτρα προφύλαξης:',
    noContraindications: 'Δεν υπάρχουν ειδικές επίσημες αντενδείξεις καταγεγραμμένες στα συνοπτικά δεδομένα.',
    interactionsIntro: (name) =>
      `Ο συνδυασμός του ${name} με ορισμένες άλλες ουσίες μπορεί να μεταβάλει απρόβλεπτα τη δράση ή να προκαλέσει ανεπιθύμητες αντιδράσεις.`,
    observeConcomitant: 'Προσοχή στις αλληλεπιδράσεις με τη συγχορηγούμενη φαρμακευτική αγωγή.',
    avoidAlcohol: 'Αποφύγετε την ταυτόχρονη κατανάλωση αλκοόλ.',
    noInteractions: 'Δεν έχουν καταχωρηθεί συγκεκριμένες αλληλεπιδράσεις στα επίσημα συνοπτικά στοιχεία.'
  },
  en: {
    introTemplate: (name, active) =>
      `Here is the complete official overview for ${name} (${active}) with all key information on ingredients, dosage, side effects, contraindications, and interactions, clearly summarized for you.`,
    sec1: '📝 1. Active Substance and Ingredients',
    sec2: '💊 2. Dosage & Administration',
    sec3: '⚠️ 3. Side Effects',
    sec4: '🚫 4. Contraindications',
    sec5: '❌ 5. Dangerous Interactions',
    belongsToGroup: 'belongs to the active substance group:',
    mainActive: 'Main active substance:',
    dosageForms: 'Dosage forms:',
    excipients: 'Excipients are listed in the respective manufacturer package leaflet.',
    dosagePrinciple: (name, active) =>
      `The dosage of ${name} (${active}) is determined strictly on an individual basis by the attending physician. The guiding rule is to administer the lowest effective dose for the shortest possible duration to minimize risks.`,
    availableDosages: 'Available dosage strengths:',
    intakeRecommendation: 'Administration recommendation:',
    elderlyWarning:
      'Elderly or debilitated patients: In elderly individuals or patients with impaired liver/kidney function, close dose adjustment following medical consultation is essential.',
    frequencyVeryCommon: 'Very common (≥ 1/10):',
    frequencyCommon: 'Common (≥ 1/100 to < 1/10):',
    frequencyUncommon: 'Uncommon (≥ 1/1,000 to < 1/100):',
    frequencyRare: 'Rare (≥ 1/10,000 to < 1/1,000):',
    frequencyVeryRare: 'Very rare (< 1/10,000):',
    commonSideEffects: 'Common side effects:',
    specialRisks: 'Special risks & warnings:',
    contraindicationsIntro: (name) =>
      `Under certain medical conditions, ${name} must either not be used at all or only after strict medical risk-benefit assessment.`,
    absoluteContraindications: 'Absolute contraindications (use excluded):',
    relativeContraindications: 'Relative contraindications (special caution required):',
    officialContraindications: 'Official contraindications & precautions:',
    noContraindications: 'No specific contraindications recorded in the summary dataset.',
    interactionsIntro: (name) =>
      `Combining ${name} with certain other substances may unpredictably alter efficacy or cause adverse reactions.`,
    observeConcomitant: 'Pay close attention to interactions with concomitant medications.',
    avoidAlcohol: 'Avoid alcohol.',
    noInteractions: 'No specific interactions recorded in the official dataset.'
  },
  es: {
    introTemplate: (name, active) =>
      `Aquí está el resumen oficial completo de ${name} (${active}) con toda la información clave sobre principios activos, posología, efectos adversos, contraindicaciones e interacciones, resumido para usted.`,
    sec1: '📝 1. Principio activo e ingredientes',
    sec2: '💊 2. Posología y forma de administración',
    sec3: '⚠️ 3. Efectos adversos',
    sec4: '🚫 4. Contraindicaciones',
    sec5: '❌ 5. Interacciones peligrosas',
    belongsToGroup: 'pertenece al grupo de principios activos:',
    mainActive: 'Principio activo principal:',
    dosageForms: 'Formas farmacéuticas:',
    excipients: 'Los excipientes se indican en el prospecto del fabricante respectivo.',
    dosagePrinciple: (name, active) =>
      `La dosificación de ${name} (${active}) la determina de forma estrictamente individual el médico tratante. Se aplica el principio de utilizar la dosis más baja y durante el menor tiempo posible para reducir riesgos.`,
    availableDosages: 'Concentraciones disponibles:',
    intakeRecommendation: 'Recomendación de toma:',
    elderlyWarning:
      'Pacientes de edad avanzada o debilitados: En personas mayores o con función hepática/renal comprometida, es indispensable un ajuste minucioso de la dosis tras consulta médica.',
    frequencyVeryCommon: 'Muy frecuentes (≥ 1/10):',
    frequencyCommon: 'Frecuentes (≥ 1/100 a < 1/10):',
    frequencyUncommon: 'Poco frecuentes (≥ 1/1.000 a < 1/100):',
    frequencyRare: 'Raras (≥ 1/10.000 a < 1/1.000):',
    frequencyVeryRare: 'Muy raras (< 1/10.000):',
    commonSideEffects: 'Efectos secundarios comunes:',
    specialRisks: 'Riesgos especiales y advertencias:',
    contraindicationsIntro: (name) =>
      `Bajo ciertas condiciones médicas, ${name} no debe utilizarse o solo tras una rigurosa evaluación médica del balance beneficio-riesgo.`,
    absoluteContraindications: 'Contraindicaciones absolutas (uso excluido):',
    relativeContraindications: 'Contraindicaciones relativas (se requiere precaución especial):',
    officialContraindications: 'Contraindicaciones y precauciones oficiales:',
    noContraindications: 'No hay contraindicaciones específicas en los datos resumidos.',
    interactionsIntro: (name) =>
      `La combinación de ${name} con ciertas sustancias puede alterar imprevisiblemente su efecto o causar reacciones adversas.`,
    observeConcomitant: 'Tenga en cuenta las interacciones con la medicación concomitante.',
    avoidAlcohol: 'Evite el consumo de alcohol.',
    noInteractions: 'No hay interacciones específicas registradas en los datos oficiales.'
  },
  fr: {
    introTemplate: (name, active) =>
      `Voici la vue d'ensemble officielle complète de ${name} (${active}) avec toutes les informations clés sur les composants, la posologie, les effets indésirables, les contre-indications et les interactions.`,
    sec1: '📝 1. Principe actif et composants',
    sec2: "💊 2. Posologie et mode d'administration",
    sec3: '⚠️ 3. Effets indésirables',
    sec4: '🚫 4. Contre-indications',
    sec5: '❌ 5. Interactions dangereuses',
    belongsToGroup: 'appartient à la classe pharmacologique :',
    mainActive: 'Principe actif principal :',
    dosageForms: "Formes d'administration :",
    excipients: 'Les excipients figurent dans la notice spécifique du fabricant.',
    dosagePrinciple: (name, active) =>
      `La posologie de ${name} (${active}) est fixée de manière strictement individuelle par le médecin traitant. Le principe est d'utiliser la dose la plus faible possible pendant la durée la plus courte pour minimiser les risques.`,
    availableDosages: 'Dosages disponibles :',
    intakeRecommendation: 'Recommandation de prise :',
    elderlyWarning:
      'Patients âgés ou affaiblis : Chez les personnes âgées ou souffrant de troubles hépatiques/rénaux, un ajustement posologique étroit après avis médical est essentiel.',
    frequencyVeryCommon: 'Très fréquent (≥ 1/10) :',
    frequencyCommon: 'Fréquent (≥ 1/100 à < 1/10) :',
    frequencyUncommon: 'Peu fréquent (≥ 1/1 000 à < 1/100) :',
    frequencyRare: 'Rare (≥ 1/10 000 à < 1/1 000) :',
    frequencyVeryRare: 'Très rare (< 1/10 000) :',
    commonSideEffects: 'Manifestations fréquentes :',
    specialRisks: 'Risques particuliers et mises en garde :',
    contraindicationsIntro: (name) =>
      `Dans certaines conditions cliniques, ${name} ne doit pas être utilisé ou seulement après une stricte évaluation médicale du rapport bénéfice/risque.`,
    absoluteContraindications: 'Contre-indications absolues (utilisation exclue) :',
    relativeContraindications: 'Contre-indications relatives (prudence particulière requise) :',
    officialContraindications: 'Contre-indications et précautions officielles :',
    noContraindications: 'Aucune contre-indication particulière enregistrée.',
    interactionsIntro: (name) =>
      `L'association de ${name} avec certaines autres substances peut modifier l'effet de façon imprévisible ou provoquer des réactions indésirables.`,
    observeConcomitant: 'Surveiller les interactions avec les traitements concomitants.',
    avoidAlcohol: "Éviter l'alcool.",
    noInteractions: 'Aucune interaction spécifique répertoriée dans les données officielles.'
  },
  it: {
    introTemplate: (name, active) =>
      `Ecco la panoramica ufficiale completa di ${name} (${active}) con tutte le informazioni essenziali su principi attivi, posologia, effetti indesiderati, controindicazioni e interazioni.`,
    sec1: '📝 1. Principio attivo e ingredienti',
    sec2: "💊 2. Posologia e modalità d'uso",
    sec3: '⚠️ 3. Effetti indesiderati',
    sec4: '🚫 4. Controindicazioni',
    sec5: '❌ 5. Interazioni pericolose',
    belongsToGroup: 'appartiene alla classe terapeutica:',
    mainActive: 'Principio attivo principale:',
    dosageForms: 'Forme farmaceutiche:',
    excipients: 'Gli eccipienti sono indicati nel relativo foglio illustrativo del produttore.',
    dosagePrinciple: (name, active) =>
      `Il dosaggio di ${name} (${active}) viene stabilito in modo strettamente individuale dal medico curante. Si applica la regola di utilizzare la dose minima efficace per la durata più breve possibile.`,
    availableDosages: 'Dosaggi disponibili:',
    intakeRecommendation: 'Modalità di assunzione:',
    elderlyWarning:
      'Pazienti anziani o debilitati: Negli anziani o in pazienti con ridotta funzionalità epatica o renale, è essenziale un attento aggiustamento della dose dopo consulto medico.',
    frequencyVeryCommon: 'Molto comune (≥ 1/10):',
    frequencyCommon: 'Comune (da ≥ 1/100 a < 1/10):',
    frequencyUncommon: 'Non comune (da ≥ 1/1.000 a < 1/100):',
    frequencyRare: 'Raro (da ≥ 1/10.000 a < 1/1.000):',
    frequencyVeryRare: 'Molto raro (< 1/10.000):',
    commonSideEffects: 'Effetti collaterali comuni:',
    specialRisks: 'Rischi particolari e avvertenze:',
    contraindicationsIntro: (name) =>
      `In determinate condizioni di salute, ${name} non deve essere utilizzato affatto o solo dopo una rigorosa valutazione medica del rapporto rischio-beneficio.`,
    absoluteContraindications: 'Controindicazioni assolute (uso escluso):',
    relativeContraindications: 'Contreindicazioni relative (richiesta particolare cautela):',
    officialContraindications: 'Controindicazioni e precauzioni ufficiali:',
    noContraindications: 'Nessuna controindicazione specifica annotata.',
    interactionsIntro: (name) =>
      `L'associazione di ${name} con determinate altre sostanze può alterare in modo imprevedibile l'efficacia o provocare reazioni avverse.`,
    observeConcomitant: 'Prestare attenzione alle interazioni con farmaci concomitanti.',
    avoidAlcohol: "Evitare l'alcol.",
    noInteractions: 'Nessuna interazione specifica riportata nei dati ufficiali.'
  },
  ru: {
    introTemplate: (name, active) =>
      `Вот полный официальный обзор препарата ${name} (${active}) со всей ключевой информацией о составе, дозировке, побочных эффектах, противопоказаниях и взаимодействиях, наглядно обобщенной для вас.`,
    sec1: '📝 1. Действующее вещество и состав',
    sec2: '💊 2. Дозировка и способ применения',
    sec3: '⚠️ 3. Побочные действия',
    sec4: '🚫 4. Противопоказания',
    sec5: '❌ 5. Опасные взаимодействия',
    belongsToGroup: 'относится к фармакологической группе:',
    mainActive: 'Основное действующее вещество:',
    dosageForms: 'Лекарственные формы:',
    excipients: 'Вспомогательные вещества указаны в инструкции производителя.',
    dosagePrinciple: (name, active) =>
      `Дозировка ${name} (${active}) определяется строго индивидуально лечащим врачом. Применяется принцип назначения минимальной эффективной дозы на кратчайший срок для снижения рисков.`,
    availableDosages: 'Доступные дозировки:',
    intakeRecommendation: 'Рекомендации по приему:',
    elderlyWarning:
      'Пожилые или ослабленные пациенты: У пожилых пациентов или лиц с нарушением функции печени/почек необходима тщательная коррекция дозы после консультации с врачом.',
    frequencyVeryCommon: 'Очень часто (≥ 1/10):',
    frequencyCommon: 'Часто (≥ 1/100 до < 1/10):',
    frequencyUncommon: 'Нечасто (≥ 1/1.000 до < 1/100):',
    frequencyRare: 'Редко (≥ 1/10.000 до < 1/1.000):',
    frequencyVeryRare: 'Очень редко (< 1/10.000):',
    commonSideEffects: 'Частые побочные явления:',
    specialRisks: 'Особые риски и предостережения:',
    contraindicationsIntro: (name) =>
      `При определенных состояниях здоровья ${name} либо не должен применяться вовсе, либо только после строгой врачебной оценки пользы и риска.`,
    absoluteContraindications: 'Абсолютные противопоказания (применение исключено):',
    relativeContraindications: 'Относительные противопоказания (требуется особая осторожность):',
    officialContraindications: 'Официальные противопоказания и меры предосторожности:',
    noContraindications: 'В кратких официальных данных особых противопоказаний не указано.',
    interactionsIntro: (name) =>
      `Сочетание ${name} с определенными другими веществами может непредсказуемо изменить действие или вызвать нежелательные реакции.`,
    observeConcomitant: 'Учитывать взаимодействия с сопутствующими лекарственными средствами.',
    avoidAlcohol: 'Избегать употребления алкоголя.',
    noInteractions: 'Специфических взаимодействий в официальных данных не указано.'
  }
};

// Common medical terms dictionary for instantaneous, zero-delay rendering in any language
const CLINICAL_PHRASES: Record<string, Record<LanguageCode, string>> = {
  // Lorazepam / Tavor specific terms
  'Benzodiazepin (Anxiolytikum / Beruhigungsmittel)': {
    de: 'Benzodiazepin (Anxiolytikum / Beruhigungsmittel)',
    el: 'Βενζοδιαζεπίνη (Αγχολυτικό / Ηρεμιστικό)',
    en: 'Benzodiazepine (Anxiolytic / Sedative)',
    es: 'Benzodiazepina (Ansiolítico / Sedante)',
    fr: 'Benzodiazépine (Anxiolytique / Sédatif)',
    it: 'Benzodiazepina (Ansiolitico / Sedativo)',
    ru: 'Бензодиазепин (Анксиолитик / Седативное средство)'
  },
  'Tabletten, Schmelztabletten (Tavor Expidet), Injektionslösung': {
    de: 'Tabletten, Schmelztabletten (Tavor Expidet), Injektionslösung',
    el: 'Δισκία, διαλυόμενα δισκία (Tavor Expidet), ενέσιμο διάλυμα',
    en: 'Tablets, orally disintegrating tablets (Tavor Expidet), injectable solution',
    es: 'Comprimidos, comprimidos bucodispersables (Tavor Expidet), solución inyectable',
    fr: 'Comprimés, comprimés orodispersibles (Tavor Expidet), solution injectable',
    it: 'Compresse, compresse orodispersibili (Tavor Expidet), soluzione iniettabile',
    ru: 'Таблетки, диспергируемые таблетки (Тавор Экспидет), раствор для инъекций'
  },
  'Streng individuell nach ärztlicher Verordnung; so niedrig dosiert und kurz wie möglich': {
    de: 'Streng individuell nach ärztlicher Verordnung; so niedrig dosiert und kurz wie möglich',
    el: 'Αυστηρά εξατομικευμένα σύμφωνα με την ιατρική συνταγή, στη χαμηλότερη δυνατή δόση και για όσο το δυνατόν μικρότερο χρονικό διάστημα',
    en: 'Strictly individualized according to medical prescription; lowest dose and shortest duration possible',
    es: 'Estrictamente individualizado según prescripción médica; a la dosis más baja y duración más corta posible',
    fr: 'Strictement individualisé selon la prescription médicale ; à la dose la plus faible et la durée la plus courte possible',
    it: 'Strettamente individualizzato secondo prescrizione medica; al dosaggio più basso e per il minor tempo possibile',
    ru: 'Строго индивидуально по назначению врача; в минимальной дозе и на кратчайший срок'
  },
  'Müdigkeit, Schläfrigkeit, Benommenheit, verlangsamtes Reaktionsvermögen, Muskelschwäche, Gangunsicherheit (erhöhtes Sturzrisiko), Müdigkeitsgefühle am Folgetag, Anterograde Amnesie (Erinnerungslücken)': {
    de: 'Müdigkeit, Schläfrigkeit, Benommenheit, verlangsamtes Reaktionsvermögen, Muskelschwäche, Gangunsicherheit (erhöhtes Sturzrisiko), Müdigkeitsgefühle am Folgetag, Anterograde Amnesie (Erinnerungslücken)',
    el: 'Κόπωση, υπνηλία, ζάλη/θόλωση, επιβράδυνση αντανακλαστικών, μυϊκή αδυναμία, αστάθεια βάδισης (αυξημένος κίνδυνος πτώσης), αίσθημα κόπωσης την επόμενη ημέρα, προσθιόδρομη αμνησία (κενά μνήμης)',
    en: 'Fatigue, somnolence, drowsiness, slowed reaction time, muscle weakness, gait unsteadiness (increased fall risk), next-day fatigue, anterograde amnesia (memory lapses)',
    es: 'Fatiga, somnolencia, mareo/aturdimiento, reflejos lentos, debilidad muscular, inestabilidad en la marcha (mayor riesgo de caídas), fatiga al día siguiente, amnesia anterógrada',
    fr: 'Fatigue, somnolence, étourdissements, ralentissement des réflexes, faiblesse musculaire, démarche instable (risque accru de chutes), somnolence résiduelle, amnésie antérograde',
    it: 'Stanchezza, sonnolenza, stordimento, riflessi rallentati, debolezza muscolare, andatura instabile (aumentato rischio di cadute), sonnolenza al risveglio, amnesia anterograda',
    ru: 'Усталость, сонливость, головокружение, замедление реакций, мышечная слабость, неустойчивость походки (риск падений), седация на следующий день, антероградная амнезия'
  },
  'Paradoxe Reaktionen (Unruhe, Reizbarkeit, Aggressivität), Absetzerscheinungen bei abruptem Absetzen': {
    de: 'Paradoxe Reaktionen (Unruhe, Reizbarkeit, Aggressivität), Absetzerscheinungen bei abruptem Absetzen',
    el: 'Παράδοξες αντιδράσεις (ανησυχία, ευερεθιστότητα, επιθετικότητα), συμπτώματα στέρησης σε περίπτωση απότομης διακοπής',
    en: 'Paradoxical reactions (restlessness, irritability, aggressiveness), withdrawal symptoms upon abrupt discontinuation',
    es: 'Reacciones paradójicas (inquietud, irritabilidad, agresividad), síntomas de abstinencia ante la interrupción brusca',
    fr: 'Réactions paradoxales (agitation, irritabilité, agressivité), syndrome de sevrage en cas d’arrêt brutal',
    it: 'Reazioni paradosse (irrequietezza, irritabilità, aggressività), sintomi da astinenza in caso di interruzione brusca',
    ru: 'Парадоксальные реакции (беспокойство, раздражительность, агрессивность), синдром отмены при резком прекращении приема'
  },
  'Gefahr von Abhängigkeit und Toleranzentwicklung bereits nach wenigen Wochen. Nicht plötzlich absetzen, sondern ausschleichend reduzieren. Fahrtüchtigkeit und das Bedienen von Maschinen werden erheblich beeinträchtigt.': {
    de: 'Gefahr von Abhängigkeit und Toleranzentwicklung bereits nach wenigen Wochen. Nicht plötzlich absetzen, sondern ausschleichend reduzieren. Fahrtüchtigkeit und das Bedienen von Maschinen werden erheblich beeinträchtigt.',
    el: 'Κίνδυνος εξάρτησης και ανάπτυξης ανοχής ήδη μετά από λίγες εβδομάδες. Μην διακόπτετε απότομα, αλλά με σταδιακή μείωση (tapering). Η ικανότητα οδήγησης και χειρισμού μηχανημάτων επηρεάζεται σημαντικά.',
    en: 'Risk of physical and psychological dependence and tolerance development even after a few weeks. Do not stop abruptly; taper off gradually. Ability to drive or operate machinery is significantly impaired.',
    es: 'Riesgo de dependencia y tolerancia ya tras pocas semanas. No suspender bruscamente, sino de forma gradual. La capacidad para conducir y utilizar maquinaria se ve gravemente afectada.',
    fr: "Risque de dépendance et de tolérance dès quelques semaines d'utilisation. Ne pas arrêter brusquement, procéder par réduction progressive. L'aptitude à conduire et à utiliser des machines est fortement altérée.",
    it: 'Rischio di dipendenza e tolleranza già dopo poche settimane. Non interrompere bruscamente, ma ridurre gradualmente. La capacità di guidare e usare macchinari è significativamente compromessa.',
    ru: 'Риск зависимости и развития толерантности уже через несколько недель. Не отменять резко, снижать дозу постепенно. Способность управлять автомобилем и механизмами существенно нарушается.'
  },
  'Myasthenia gravis, schwere Ateminsuffizienz, Schlafapnoe-Syndrom, schwere Leberinsuffizienz, Überempfindlichkeit gegen Benzodiazepine, akute Vergiftung mit Alkohol oder ZNS-Dämpfern': {
    de: 'Myasthenia gravis, schwere Ateminsuffizienz, Schlafapnoe-Syndrom, schwere Leberinsuffizienz, Überempfindlichkeit gegen Benzodiazepine, akute Vergiftung mit Alkohol oder ZNS-Dämpfern',
    el: 'Βαριά μυασθένεια (Myasthenia gravis), σοβαρή αναπνευστική ανεπάρκεια, σύνδρομο υπνικής άπνοιας, σοβαρή ηπατική ανεπάρκεια, υπερευαισθησία στις βενζοδιαζεπίνες, οξεία δηλητηρίαση από αλκοόλ ή κατασταλτικά του ΚΝΣ',
    en: 'Myasthenia gravis, severe respiratory failure, sleep apnea syndrome, severe hepatic impairment, hypersensitivity to benzodiazepines, acute poisoning with alcohol or CNS depressants',
    es: 'Miastenia gravis, insuficiencia respiratoria grave, síndrome de apnea del sueño, insuficiencia hepática grave, hipersensibilidad a las benzodiazepinas, intoxicación aguda por alcohol o depresores del SNC',
    fr: 'Myasthénie grave, insuffisance respiratoire sévère, syndrome d’apnée du sommeil, insuffisance hépatique sévère, hypersensibilité aux benzodiazépines, intoxication aiguë par l’alcool ou sédatifs du SNC',
    it: 'Miastenia gravis, grave insufficienza respiratoria, sindrome delle apnee notturne, grave insufficienza epatica, ipersensibilità alle benzodiazepine, intossicazione acuta da alcol o depressori del SNC',
    ru: 'Миастения гравис, тяжелая дыхательная недостаточность, синдром апноэ во сне, тяжелая печеночная недостаточность, гиперчувствительность к бензодиазепинам, острая интоксикация алкоголем или депрессантами ЦНΣ'
  },
  'Gleichzeitige Anwendung von Opioiden: Erheblich erhöhtes Risiko für schwere Sedierung, Atemdepression, Koma und Tod': {
    de: 'Gleichzeitige Anwendung von Opioiden: Erheblich erhöhtes Risiko für schwere Sedierung, Atemdepression, Koma und Tod',
    el: 'Ταυτόχρονη χρήση οπιοειδών: Σημαντικά αυξημένος κίνδυνος βαθιάς καταστολής, αναπνευστικής καταστολής, κώματος και θανάτου',
    en: 'Concomitant use of opioids: Significantly increased risk of severe sedation, respiratory depression, coma, and death',
    es: 'Uso concomitante de opioides: Riesgo significativamente mayor de sedación profunda, depresión respiratoria, coma y muerte',
    fr: 'Utilisation concomitante d’opioïdes : Risque considérablement accru de sédation profonde, dépression respiratoire, coma et décès',
    it: 'Uso concomitante di oppioidi: Rischio notevolmente aumentato di grave sedazione, depressione respiratoria, coma e morte',
    ru: 'Одновременное применение с опиоидами: Значительно повышенный риск глубокой седации, угнетения дыхания, комы и летального исхода'
  },
  'Alkohol: Verstärkt die sedierende Wirkung unvorhersehbar und gefährlich; absolutes Alkoholverbot während der Therapie': {
    de: 'Alkohol: Verstärkt die sedierende Wirkung unvorhersehbar und gefährlich; absolutes Alkoholverbot während der Therapie',
    el: 'Αλκοόλ: Ενισχύει την κατασταλτική δράση απρόβλεπτα και επικίνδυνα. Απόλυτη αποφυγή αλκοόλ κατά τη διάρκεια της θεραπείας',
    en: 'Alcohol: Potentiates sedative effects unpredictably and dangerously; complete alcohol avoidance required during therapy',
    es: 'Alcohol: Potencia el efecto sedante de forma imprevisible y peligrosa; prohibición absoluta de alcohol durante el tratamiento',
    fr: 'Alcool : Majore l’effet sédatif de façon imprévisible et dangereuse ; abstention totale d’alcool recommandée pendant le traitement',
    it: 'Alcol: Potenzia l’effetto sedativo in modo imprevedibile e pericoloso; divieto assoluto di alcolici durante la terapia',
    ru: 'Алкоголь: Непредсказуемо и опасно усиливает седативный эффект; категорический запрет алкоголя во время терапии'
  },
  'Andere ZNS-dämpfende Arzneimittel (Antipsychotika, Antidepressiva, Sedativa, Schlafmittel): Gegenseitige Wirkungsverstärkung': {
    de: 'Andere ZNS-dämpfende Arzneimittel (Antipsychotika, Antidepressiva, Sedativa, Schlafmittel): Gegenseitige Wirkungsverstärkung',
    el: 'Άλλα κατασταλτικά φάρμακα του ΚΝΣ (αντιψυχωσικά, αντικαταθλιπτικά, υπνωτικά, ηρεμιστικά): Αμοιβαία ενίσχυση της δράσης',
    en: 'Other CNS depressant drugs (antipsychotics, antidepressants, sedatives, hypnotics): Mutual potentiation of effects',
    es: 'Otros fármacos depresores del SNC (antipsicóticos, antidepresivos, sedantes, hipnóticos): Potenciación mutua del efecto',
    fr: 'Autres médicaments dépresseurs du SNC (antipsychotiques, antidépresseurs, sédatifs, hypnotiques) : Majoration réciproque des effets',
    it: 'Altri farmaci deprimenti il SNC (antipsicotici, antidepressivi, sedativi, ipnotici): Potenziamento reciproco dell’effetto',
    ru: 'Другие средства, угнетающие ЦНС (нейролептики, антидепрессанты, седативные, снотворные): Взаимное усиление действия'
  },
  // Analgesics / Antipyretics / Aspirin / NSAIDs
  'Acetylsalicylsäure / Vitamin C': {
    de: 'Acetylsalicylsäure / Vitamin C',
    el: 'Ακετυλοσαλικυλικό οξύ / Βιταμίνη C',
    en: 'Acetylsalicylic acid / Vitamin C',
    es: 'Ácido acetilsalicílico / Vitamina C',
    fr: 'Acide acétylsalicylique / Vitamine C',
    it: 'Acido acetilsalicilico / Vitamina C',
    ru: 'Ацетилсалициловая кислота / Витамин C'
  },
  'Acetylsalicylsäure': {
    de: 'Acetylsalicylsäure',
    el: 'Ακετυλοσαλικυλικό οξύ',
    en: 'Acetylsalicylic acid',
    es: 'Ácido acetilsalicílico',
    fr: 'Acide acétylsalicylique',
    it: 'Acido acetilsalicilico',
    ru: 'Ацетилсалициловая кислота'
  },
  'Analgetikum & Antipyretikum': {
    de: 'Analgetikum & Antipyretikum',
    el: 'Αναλγητικό & αντιπυρετικό',
    en: 'Analgesic & antipyretic',
    es: 'Analgésico y antipirético',
    fr: 'Analgésique et antipyrétique',
    it: 'Analgesico e antipiretico',
    ru: 'Анальгетик и антипиретик'
  },
  'Analgetika und Antipyretika': {
    de: 'Analgetika und Antipyretika',
    el: 'Αναλγητικά και αντιπυρετικά',
    en: 'Analgesics and antipyretics',
    es: 'Analgésicos y antipiréticos',
    fr: 'Analgésiques et antipyrétiques',
    it: 'Analgesici e antipiretici',
    ru: 'Анальгетики и антипиретики'
  },
  'NSAR / Nichtsteroidales Antirheumatikum': {
    de: 'NSAR / Nichtsteroidales Antirheumatikum',
    el: 'ΜΣΑΦ / Μη στεροειδές αντιφλεγμονώδες',
    en: 'NSAID / Nonsteroidal anti-inflammatory drug',
    es: 'AINE / Antiinflamatorio no esteroideo',
    fr: 'AINS / Anti-inflammatoire non stéroïdien',
    it: 'FANS / Farmaco antinfiammatorio non steroideo',
    ru: 'НПВП / Нестероидный противовоспалительный препарат'
  },
  'Kombiniertes Erkältungsmittel': {
    de: 'Kombiniertes Erkältungsmittel',
    el: 'Συνδυασμένο φάρμακο για το κρυολόγημα',
    en: 'Combination cold remedy',
    es: 'Medicamento combinado para el resfriado',
    fr: 'Traitement combiné du rhume',
    it: 'Antinfluenzale combinato',
    ru: 'Комбинированное противопростудное средство'
  },
  'Kardioselektiver Betablocker': {
    de: 'Kardioselektiver Betablocker',
    el: 'Καρδιοεκλεκτικός β-αποκλειστής',
    en: 'Cardioselective beta-blocker',
    es: 'Betabloqueante cardioselectivo',
    fr: 'Bêta-bloquant cardiosélectif',
    it: 'Betabloccante cardioselettivo',
    ru: 'Кардиоселективный бета-блокатор'
  },
  'ACE-Hemmer (Blutdruck & Herz)': {
    de: 'ACE-Hemmer (Blutdruck & Herz)',
    el: 'Αναστολέας ΜΕΑ (Πίεση & καρδιά)',
    en: 'ACE inhibitor (Blood pressure & heart)',
    es: 'Inhibidor de la ECA (Presión arterial y corazón)',
    fr: "Inhibiteur de l'ECA (Tension et cœur)",
    it: 'ACE-inibitore (Pressione arteriosa e cuore)',
    ru: 'Ингибитор АПФ (Давление и сердце)'
  },
  'Protonenpumpenhemmer (PPI)': {
    de: 'Protonenpumpenhemmer (PPI)',
    el: 'Αναστολέας αντλίας πρωτονίων (PPI)',
    en: 'Proton pump inhibitor (PPI)',
    es: 'Inhibidor de la bomba de protones (IBP)',
    fr: 'Inhibiteur de la pompe à protons (IPP)',
    it: 'Inibitore della pompa protonica (IPP)',
    ru: 'Ингибитор протонной помпы (ИПП)'
  },
  'Schilddrüsenhormon': {
    de: 'Schilddrüsenhormon',
    el: 'Θυρεοειδική ορμόνη',
    en: 'Thyroid hormone',
    es: 'Hormona tiroidea',
    fr: 'Hormone thyroïdienne',
    it: 'Ormone tiroideo',
    ru: 'Тиреоидный гормон'
  },
  // Common side effects
  'Gastrointestinale Beschwerden, Müdigkeit': {
    de: 'Gastrointestinale Beschwerden, Müdigkeit',
    el: 'Γαστρεντερικές ενοχλήσεις, κόπωση',
    en: 'Gastrointestinal complaints, fatigue',
    es: 'Molestias gastrointestinales, fatiga',
    fr: 'Troubles gastro-intestinaux, fatigue',
    it: 'Disturbi gastrointestinali, affaticamento',
    ru: 'Желудочно-кишечные расстройства, утомляемость'
  },
  'Gastrointestinale Beschwerden': {
    de: 'Gastrointestinale Beschwerden',
    el: 'Γαστρεντερικές ενοχλήσεις',
    en: 'Gastrointestinal complaints',
    es: 'Molestias gastrointestinales',
    fr: 'Troubles gastro-intestinaux',
    it: 'Disturbi gastrointestinali',
    ru: 'Желудочно-кишечные расстройства'
  },
  'Hautausschlag, Kopfschmerzen': {
    de: 'Hautausschlag, Kopfschmerzen',
    el: 'Δερματικό εξάνθημα, κεφαλαλγία',
    en: 'Skin rash, headache',
    es: 'Erupción cutánea, dolor de cabeza',
    fr: 'Éruption cutanée, maux de tête',
    it: 'Eruzione cutanea, cefalea',
    ru: 'Кожная сыпь, головная боль'
  },
  'Hautausschlag': {
    de: 'Hautausschlag',
    el: 'Δερματικό εξάνθημα',
    en: 'Skin rash',
    es: 'Erupción cutánea',
    fr: 'Éruption cutanée',
    it: 'Eruzione cutanea',
    ru: 'Кожная сыпь'
  },
  'Kopfschmerzen': {
    de: 'Kopfschmerzen',
    el: 'Κεφαλαλγία',
    en: 'Headache',
    es: 'Cefalea',
    fr: 'Céphalées / Maux de tête',
    it: 'Cefalea',
    ru: 'Головная боль'
  },
  'Kopfschmerz': {
    de: 'Kopfschmerz',
    el: 'Κεφαλαλγία',
    en: 'Headache',
    es: 'Cefalea',
    fr: 'Céphalée',
    it: 'Cefalea',
    ru: 'Головная боль'
  },
  'Müdigkeit': {
    de: 'Müdigkeit',
    el: 'Κόπωση',
    en: 'Fatigue',
    es: 'Fatiga',
    fr: 'Fatigue',
    it: 'Affaticamento',
    ru: 'Утомляемость'
  },
  'Schwindel': {
    de: 'Schwindel',
    el: 'Ζάλη',
    en: 'Dizziness',
    es: 'Mareos',
    fr: 'Vertiges',
    it: 'Vertigini',
    ru: 'Головокружение'
  },
  'Schwindelgefühl': {
    de: 'Schwindelgefühl',
    el: 'Αίσθημα ζάλης',
    en: 'Dizziness',
    es: 'Sensación de mareo',
    fr: 'Sensations vertigineuses',
    it: 'Senso di vertigine',
    ru: 'Головокружение'
  },
  'Übelkeit': {
    de: 'Übelkeit',
    el: 'Ναυτία',
    en: 'Nausea',
    es: 'Náuseas',
    fr: 'Nausées',
    it: 'Nausea',
    ru: 'Тошнота'
  },
  'Mundtrockenheit': {
    de: 'Mundtrockenheit',
    el: 'Ξηροστομία',
    en: 'Dry mouth',
    es: 'Boca seca',
    fr: 'Bouche sèche',
    it: 'Secchezza delle fauci',
    ru: 'Сухость во рту'
  },
  'Obstipation': {
    de: 'Obstipation',
    el: 'Δυσκοιλιότητα',
    en: 'Constipation',
    es: 'Estreñimiento',
    fr: 'Constipation',
    it: 'Stitichezza / Stipsi',
    ru: 'Запор'
  },
  'Diarrhoe': {
    de: 'Diarrhoe',
    el: 'Διάρροια',
    en: 'Diarrhea',
    es: 'Diarrea',
    fr: 'Diarrhée',
    it: 'Diarrea',
    ru: 'Диарея'
  },
  'Hautreaktionen': {
    de: 'Hautreaktionen',
    el: 'Δερματικές αντιδράσεις',
    en: 'Skin reactions',
    es: 'Reacciones cutáneas',
    fr: 'Réactions cutanées',
    it: 'Reazioni cutanee',
    ru: 'Кожные реакции'
  },
  'Gewichtszunahme': {
    de: 'Gewichtszunahme',
    el: 'Αύξηση βάρους',
    en: 'Weight gain',
    es: 'Aumento de peso',
    fr: 'Prise de poids',
    it: 'Aumento di peso',
    ru: 'Увеличение веса'
  },
  'Bradykardie': {
    de: 'Bradykardie',
    el: 'Βραδυκαρδία',
    en: 'Bradycardia',
    es: 'Bradicardia',
    fr: 'Bradycardie',
    it: 'Bradicardia',
    ru: 'Брадикардия'
  },
  'Hypotonie': {
    de: 'Hypotonie',
    el: 'Υπόταση',
    en: 'Hypotension',
    es: 'Hipotensión',
    fr: 'Hypotension',
    it: 'Ipotensione',
    ru: 'Гипотензия'
  },
  'Blutungen': {
    de: 'Blutungen',
    el: 'Αιμορραγία',
    en: 'Bleeding',
    es: 'Hemorragias',
    fr: 'Saignements / Hémorragies',
    it: 'Emorragie',
    ru: 'Кровотечения'
  },
  'Sedierung': {
    de: 'Sedierung',
    el: 'Καταστολή',
    en: 'Sedation',
    es: 'Sedación',
    fr: 'Sédation',
    it: 'Sedazione',
    ru: 'Седация'
  },
  'Hypoglykämie': {
    de: 'Hypoglykämie',
    el: 'Υπογλυκαιμία',
    en: 'Hypoglycemia',
    es: 'Hipoglucemia',
    fr: 'Hypoglycémie',
    it: 'Ipoglicemia',
    ru: 'Гипогликемия'
  },
  'Hypokaliämie': {
    de: 'Hypokaliämie',
    el: 'Υποκαλιαιμία',
    en: 'Hypokalemia',
    es: 'Hipopotasemia',
    fr: 'Hypokaliémie',
    it: 'Ipokaliemia',
    ru: 'Гипокалиемия'
  },
  'Schläfrigkeit': {
    de: 'Schläfrigkeit',
    el: 'Υπνηλία',
    en: 'Somnolence / Drowsiness',
    es: 'Somnolencia',
    fr: 'Somnolence',
    it: 'Sonnolenza',
    ru: 'Сонливость'
  },
  'Schlafstörungen': {
    de: 'Schlafstörungen',
    el: 'Διαταραχές ύπνου',
    en: 'Sleep disturbances',
    es: 'Trastornos del sueño',
    fr: 'Troubles du sommeil',
    it: 'Disturbi del sonno',
    ru: 'Нарушения сна'
  },
  'Ödeme': {
    de: 'Ödeme',
    el: 'Οιδήματα',
    en: 'Edema',
    es: 'Edemas',
    fr: 'Œdèmes',
    it: 'Edemi',
    ru: 'Отеки'
  },
  // Frequent interactions
  'Wechselwirkungen mit Begleitmedikation beachten': {
    de: 'Wechselwirkungen mit Begleitmedikation beachten',
    el: 'Προσοχή στις αλληλεπιδράσεις με συγχορηγούμενα φάρμακα',
    en: 'Observe interactions with concomitant medication',
    es: 'Prestar atención a las interacciones con medicación concomitante',
    fr: 'Faire attention aux interactions avec les médicaments concomitants',
    it: 'Prestare attenzione alle interazioni con farmaci concomitanti',
    ru: 'Учитывать взаимодействия с сопутствующими препаратами'
  },
  'Alkohol meiden': {
    de: 'Alkohol meiden',
    el: 'Αποφύγετε το αλκοόλ',
    en: 'Avoid alcohol',
    es: 'Evitar el alcohol',
    fr: "Éviter l'alcool",
    it: "Evitare l'alcol",
    ru: 'Избегать алкоголя'
  },
  'Alkohol': {
    de: 'Alkohol',
    el: 'Αλκοόλ',
    en: 'Alcohol',
    es: 'Alcohol',
    fr: 'Alcool',
    it: 'Alcol',
    ru: 'Алкоголь'
  },
  // Frequent warnings
  'Gebrauchsinformation beachten. Bei Unverträglichkeit Arzt kontaktieren.': {
    de: 'Gebrauchsinformation beachten. Bei Unverträglichkeit Arzt kontaktieren.',
    el: 'Συμβουλευτείτε το φύλλο οδηγιών. Σε περίπτωση δυσανεξίας επικοινωνήστε με ιατρό.',
    en: 'Consult package leaflet. Contact doctor in case of intolerance.',
    es: 'Consultar el prospecto. En caso de intolerancia, consultar al médico.',
    fr: "Consulter la notice. En cas d'intolérance, contacter un médecin.",
    it: 'Consultare il foglio illustrativo. In caso di intolleranza, contattare il medico.',
    ru: 'Ознакомьтесь с инструкцией. При непереносимости обратитесь к врачу.'
  },
  'Gebrauchsinformation beachten.': {
    de: 'Gebrauchsinformation beachten.',
    el: 'Συμβουλευτείτε το φύλλο οδηγιών.',
    en: 'Consult package leaflet.',
    es: 'Consultar el prospecto.',
    fr: 'Consulter la notice.',
    it: 'Consultare il foglio illustrativo.',
    ru: 'Ознакомьтесь с инструкцией.'
  },
  'Regelmäßige ärztliche Kontrollen empfohlen. Bei Unverträglichkeit Arzt konsultieren.': {
    de: 'Regelmäßige ärztliche Kontrollen empfohlen. Bei Unverträglichkeit Arzt konsultieren.',
    el: 'Συνιστώνται τακτικοί ιατρικοί έλεγχοι. Σε περίπτωση δυσανεξίας συμβουλευτείτε ιατρό.',
    en: 'Regular medical check-ups recommended. Consult doctor if intolerance occurs.',
    es: 'Se recomiendan controles médicos periódicos. En caso de intolerancia consultar al médico.',
    fr: "Contrôles médicaux réguliers recommandés. En cas d'intolérance, consulter un médecin.",
    it: 'Si raccomandano controlli medici regolari. In caso di intolleranza consultare il medico.',
    ru: 'Рекомендуются регулярные медицинские осмотры. При непереносимости обратитесь к врачу.'
  },
  'Regelmäßige ärztliche Kontrollen empfohlen.': {
    de: 'Regelmäßige ärztliche Kontrollen empfohlen.',
    el: 'Συνιστώνται τακτικοί ιατρικοί έλεγχοι.',
    en: 'Regular medical check-ups recommended.',
    es: 'Se recomiendan controles médicos periódicos.',
    fr: 'Contrôles médicaux réguliers recommandés.',
    it: 'Si raccomandano controlli medici regolari.',
    ru: 'Рекомендуются регулярные медицинские осмотры.'
  },
  'Keine behördlichen Angaben in der Fachinformation hinterlegt': {
    de: 'Keine behördlichen Angaben in der Fachinformation hinterlegt',
    el: 'Δεν υπάρχουν επίσημα στοιχεία στις πληροφορίες του προϊόντος',
    en: 'No official information recorded in the summary of product characteristics',
    es: 'No hay datos oficiales en la ficha técnica',
    fr: 'Aucune donnée officielle enregistrée dans le résumé des caractéristiques',
    it: 'Nessuna indicazione ufficiale registrata nelle informazioni sul prodotto',
    ru: 'В официальной инструкции данных не указано'
  },
  // Intake & forms
  'In Wasser gelöst trinken': {
    de: 'In Wasser gelöst trinken',
    el: 'Πίνεται διαλυμένο σε νερό',
    en: 'Drink dissolved in water',
    es: 'Beber disuelto en agua',
    fr: "Boire dissous dans l'eau",
    it: 'Assumere disciolto in acqua',
    ru: 'Пить растворенным в воде'
  }
};

/**
 * Parses and translates a German monograph into the target language.
 * Performs fast, deterministic localization of headers, intros, frequency categories,
 * clinical phrasing, and labels, ensuring an instant, native UI experience.
 */
export function localizeMonograph(rawMonograph: string, targetLang: LanguageCode): string {
  if (!rawMonograph || !rawMonograph.trim()) return '';
  const sanitized = rawMonograph
    .replace(/\uFFFD/g, '')
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
    .replace(/(?<![\u2600-\u27BF\uD83C-\uD83F])[\uFE0E\uFE0F]/g, '');
  if (targetLang === 'de') return sanitized;

  const h = MONOGRAPH_SECTIONS_I18N[targetLang] || MONOGRAPH_SECTIONS_I18N.en;
  const lines = sanitized.split('\n');

  // Extract drug name and active substance from intro or first lines
  let extractedName = '';
  let extractedActive = '';

  const firstLine = lines[0]?.trim() || '';
  const matchIntro = firstLine.match(/Übersicht zu\s+([^(]+)\s*\(([^)]+)\)/i) ||
                     firstLine.match(/overview for\s+([^(]+)\s*\(([^)]+)\)/i) ||
                     firstLine.match(/επισκόπηση για το\s+([^(]+)\s*\(([^)]+)\)/i);

  if (matchIntro) {
    extractedName = matchIntro[1].trim();
    extractedActive = matchIntro[2].trim();
  }

  const translatedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      translatedLines.push('');
      continue;
    }

    // 0. Intro Line
    if (
      i === 0 ||
      trimmed.startsWith('Hier ist die komplette Übersicht') ||
      trimmed.startsWith('Here is the complete') ||
      trimmed.startsWith('Εδώ είναι η πλήρης') ||
      trimmed.startsWith('Aquí está el resumen') ||
      trimmed.startsWith('Voici la vue') ||
      trimmed.startsWith('Ecco la panoramica') ||
      trimmed.startsWith('Вот полный обзор')
    ) {
      const name = extractedName || 'dem Präparat';
      const active = extractedActive || name;
      translatedLines.push(h.introTemplate(name, active));
      continue;
    }

    // 1. Section Headers
    if (trimmed.startsWith('📝') || trimmed.includes('1. Wirkstoff') || trimmed.includes('1. Active') || trimmed.includes('1. Δραστική')) {
      translatedLines.push(h.sec1);
      continue;
    }
    if (trimmed.startsWith('💊') || trimmed.includes('2. Dosierung') || trimmed.includes('2. Dosage') || trimmed.includes('2. Δοσολογία')) {
      translatedLines.push(h.sec2);
      continue;
    }
    if (trimmed.startsWith('⚠️') || trimmed.includes('3. Nebenwirkungen') || trimmed.includes('3. Side Effects') || trimmed.includes('3. Ανεπιθύμητες')) {
      translatedLines.push(h.sec3);
      continue;
    }
    if (trimmed.startsWith('🚫') || trimmed.includes('4. Kontraindikationen') || trimmed.includes('4. Contraindications') || trimmed.includes('4. Αντενδείξεις')) {
      translatedLines.push(h.sec4);
      continue;
    }
    if (trimmed.startsWith('❌') || trimmed.includes('5. Gefährliche') || trimmed.includes('5. Dangerous') || trimmed.includes('5. Επικίνδυνες')) {
      translatedLines.push(h.sec5);
      continue;
    }

    // Check direct clinical dictionary matches
    let processedLine = trimmed;
    for (const [germanKey, translations] of Object.entries(CLINICAL_PHRASES)) {
      if (processedLine.includes(germanKey)) {
        const replacement = translations[targetLang] || translations.en;
        processedLine = processedLine.replace(germanKey, replacement);
      }
    }

    // 2. Specific Line Transformations & Label Replacements
    // Belongs to drug group
    if (processedLine.includes('gehört zur Wirkstoffgruppe:') || processedLine.includes('gehört zur Gruppe:')) {
      processedLine = processedLine
        .replace('gehört zur Wirkstoffgruppe:', h.belongsToGroup)
        .replace('gehört zur Gruppe:', h.belongsToGroup);
    }

    if (processedLine.startsWith('Hauptwirkstoff:')) {
      processedLine = processedLine.replace('Hauptwirkstoff:', h.mainActive);
    }

    if (processedLine.startsWith('Darreichungsformen:')) {
      processedLine = processedLine
        .replace('Darreichungsformen:', h.dosageForms)
        .replace('Hilfsstoffe sind der jeweiligen herstellerspezifischen Packungsbeilage zu entnehmen.', h.excipients);
    }

    // Dosage principle
    if (processedLine.includes('wird von der behandelnden Ärztin oder dem Arzt streng individuell festgelegt')) {
      const name = extractedName || 'dem Präparat';
      const active = extractedActive || name;
      processedLine = h.dosagePrinciple(name, active);
    }

    if (processedLine.startsWith('Verfügbare Dosierungsstärken:')) {
      processedLine = processedLine.replace('Verfügbare Dosierungsstärken:', h.availableDosages);
    }

    if (processedLine.startsWith('Einnahmeempfehlung:')) {
      processedLine = processedLine.replace('Einnahmeempfehlung:', h.intakeRecommendation);
    }

    if (processedLine.includes('Ältere oder geschwächte Patienten:')) {
      processedLine = h.elderlyWarning;
    }

    // Frequency Categories
    if (processedLine.startsWith('Sehr häufig (≥ 1/10):')) {
      processedLine = processedLine.replace('Sehr häufig (≥ 1/10):', h.frequencyVeryCommon);
    } else if (processedLine.startsWith('Häufig (≥ 1/100 bis < 1/10):')) {
      processedLine = processedLine.replace('Häufig (≥ 1/100 bis < 1/10):', h.frequencyCommon);
    } else if (processedLine.startsWith('Gelegentlich (≥ 1/1.000 bis < 1/100):')) {
      processedLine = processedLine.replace('Gelegentlich (≥ 1/1.000 bis < 1/100):', h.frequencyUncommon);
    } else if (processedLine.startsWith('Selten (≥ 1/10.000 bis < 1/1.000):')) {
      processedLine = processedLine.replace('Selten (≥ 1/10.000 bis < 1/1.000):', h.frequencyRare);
    } else if (processedLine.startsWith('Sehr selten (< 1/10.000):')) {
      processedLine = processedLine.replace('Sehr selten (< 1/10.000):', h.frequencyVeryRare);
    } else if (processedLine.startsWith('Häufige Begleiterscheinungen:')) {
      processedLine = processedLine.replace('Häufige Begleiterscheinungen:', h.commonSideEffects);
    }

    if (processedLine.startsWith('Besondere Risiken & Warnhinweise:') || processedLine.startsWith('Besondere Risiken:')) {
      processedLine = processedLine
        .replace('Besondere Risiken & Warnhinweise:', h.specialRisks)
        .replace('Besondere Risiken:', h.specialRisks);
    }

    // Contraindications Section
    if (processedLine.includes('Unter bestimmten gesundheitlichen Bedingungen darf')) {
      const name = extractedName || 'dem Präparat';
      processedLine = h.contraindicationsIntro(name);
    }

    if (processedLine.startsWith('Absolute Gegenanzeigen (Anwendung ausgeschlossen):')) {
      processedLine = processedLine.replace('Absolute Gegenanzeigen (Anwendung ausgeschlossen):', h.absoluteContraindications);
    }

    if (processedLine.startsWith('Relative Gegenanzeigen (Besondere Vorsicht erforderlich):')) {
      processedLine = processedLine.replace('Relative Gegenanzeigen (Besondere Vorsicht erforderlich):', h.relativeContraindications);
    }

    if (processedLine.startsWith('Behördliche Gegenanzeigen & Vorsichtsmaßnahmen:')) {
      processedLine = processedLine.replace('Behördliche Gegenanzeigen & Vorsichtsmaßnahmen:', h.officialContraindications);
    }

    // Interactions Section
    if (processedLine.includes('Die Kombination von') && processedLine.includes('mit bestimmten anderen Substanzen')) {
      const name = extractedName || 'dem Präparat';
      processedLine = h.interactionsIntro(name);
    }

    if (processedLine.includes('Wechselwirkungen mit Begleitmedikation beachten.')) {
      processedLine = processedLine.replace('Wechselwirkungen mit Begleitmedikation beachten.', h.observeConcomitant);
    }

    if (processedLine.includes('Alkohol meiden.')) {
      processedLine = processedLine.replace('Alkohol meiden.', h.avoidAlcohol);
    }

    translatedLines.push(processedLine);
  }

  return translatedLines.join('\n');
}

/**
 * Requests high-fidelity AI translation for a monograph via the backend endpoint,
 * falling back seamlessly to deterministic localization if network or AI is unavailable.
 */
export async function fetchTranslatedMonograph(
  medName: string,
  rawMonograph: string,
  targetLang: LanguageCode
): Promise<string> {
  if (!rawMonograph || !rawMonograph.trim()) return '';
  if (targetLang === 'de') return rawMonograph;

  const normalizedName = (medName || 'text').toLowerCase().trim();
  const cacheKey = `${normalizedName}_${targetLang}`;

  // 1. Check in-memory map
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 2. Check local client persistent storage
  const stored = getStoredCache();
  if (stored[cacheKey]) {
    translationCache.set(cacheKey, stored[cacheKey]);
    return stored[cacheKey];
  }

  // 3. Request server-side AI translation
  try {
    const activeTherapist = getActiveTherapist();
    const res = await fetch('/api/medications/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: rawMonograph,
        targetLang,
        medName: normalizedName,
        therapistId: activeTherapist?.id || 'th-101',
        therapistName: activeTherapist ? `${activeTherapist.vorname} ${activeTherapist.nachname}` : undefined,
        therapistEmail: activeTherapist?.email
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.translatedText && typeof data.translatedText === 'string' && data.translatedText.trim().length > 50) {
        const fullTranslation = data.translatedText.trim();
        translationCache.set(cacheKey, fullTranslation);
        saveToStoredCache(cacheKey, fullTranslation);
        return fullTranslation;
      }
    }
  } catch (err) {
    console.warn('[MedicationLocalization] Translation API error:', err);
  }

  // 4. Instant deterministic localization fallback (transient, not saved to permanent cache)
  return localizeMonograph(rawMonograph, targetLang);
}

/**
 * Asynchronously translates a clinical polypharmacy cross-comparison report into the user's active UI language.
 */
export async function fetchTranslatedComparison(
  text: string,
  targetLang: LanguageCode
): Promise<string> {
  if (!text || !text.trim()) return '';
  if (targetLang === 'de') return text;

  const cacheKey = `comparison_${targetLang}_${text.slice(0, 40).replace(/\s+/g, '_')}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const activeTherapist = getActiveTherapist();
    const res = await fetch('/api/medications/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang,
        type: 'comparison',
        medName: 'comparison_' + targetLang,
        therapistId: activeTherapist?.id || 'th-101',
        therapistName: activeTherapist ? `${activeTherapist.vorname} ${activeTherapist.nachname}` : undefined,
        therapistEmail: activeTherapist?.email
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.translatedText && typeof data.translatedText === 'string') {
        const fullTranslation = data.translatedText.trim();
        translationCache.set(cacheKey, fullTranslation);
        return fullTranslation;
      }
    }
  } catch (err) {
    console.warn('[MedicationLocalization] Comparison translation error:', err);
  }

  return text;
}

export interface StructuredMedicationInput {
  name?: string;
  activeSubstance?: string;
  category?: string;
  dosages?: string[];
  defaultDosages?: string[];
  packageSizes?: string[];
  sideEffectsByFrequency?: {
    veryCommon?: string[];
    common?: string[];
    uncommon?: string[];
    rare?: string[];
    veryRare?: string[];
  };
  sideEffects?: string[];
  interactions?: string[];
  warnings?: string;
  contraindications?: {
    absolute?: string[];
    relative?: string[];
  } | string;
  monographText?: string;
}

export interface LocalizedStructuredData {
  name?: string;
  activeSubstance?: string;
  category?: string;
  dosages?: string[];
  defaultDosages?: string[];
  packageSizes?: string[];
  sideEffectsByFrequency?: {
    veryCommon?: string[];
    common?: string[];
    uncommon?: string[];
    rare?: string[];
    veryRare?: string[];
  };
  sideEffects?: string[];
  interactions?: string[];
  warnings?: string;
  contraindications?: {
    absolute?: string[];
    relative?: string[];
  } | string;
  monographText?: string;
}

/**
 * Translates a clinical term or sentence into the target language using the clinical dictionary.
 */
export function localizeClinicalText(text: string | undefined, targetLang: LanguageCode): string {
  if (!text || !text.trim()) return '';
  if (targetLang === 'de') return text;

  const trimmed = text.trim();

  // 1. Direct match in dictionary
  if (CLINICAL_PHRASES[trimmed]) {
    return CLINICAL_PHRASES[trimmed][targetLang] || CLINICAL_PHRASES[trimmed].en || trimmed;
  }

  // 2. Case-insensitive or normalized match
  for (const [key, trans] of Object.entries(CLINICAL_PHRASES)) {
    if (key.toLowerCase() === trimmed.toLowerCase()) {
      return trans[targetLang] || trans.en || trimmed;
    }
  }

  // 3. Substring replacement for composite text
  let result = trimmed;
  for (const [key, trans] of Object.entries(CLINICAL_PHRASES)) {
    if (result.includes(key)) {
      const replacement = trans[targetLang] || trans.en;
      result = result.split(key).join(replacement);
    }
  }

  return result;
}

/**
 * Localizes package sizes (e.g., 'N1 (10-20 Stk.)' -> 'N1 (10-20 pz.)')
 */
export function localizePackageSize(pkg: string | undefined, targetLang: LanguageCode): string {
  if (!pkg) return '';
  if (targetLang === 'de') return pkg;

  const unitMap: Record<LanguageCode, string> = {
    de: 'Stk.',
    en: 'pcs.',
    it: 'pz.',
    es: 'uds.',
    fr: 'pièces',
    el: 'τεμ.',
    ru: 'шт.'
  };

  const formMap: Record<string, Record<LanguageCode, string>> = {
    'Filmtablette': { de: 'Filmtablette', en: 'Film-coated tablet', it: 'Compressa rivestita con film', es: 'Comprimido recubierto', fr: 'Comprimé pelliculé', el: 'Επικαλυμμένο δισκίο', ru: 'Таблетка, покрытая оболочкой' },
    'Filmtabletten': { de: 'Filmtabletten', en: 'Film-coated tablets', it: 'Compresse rivestite con film', es: 'Comprimidos recubiertos', fr: 'Comprimés pelliculés', el: 'Επικαλυμμένα δισκία', ru: 'Таблетки, покрытые оболочкой' },
    'Brausetabletten': { de: 'Brausetabletten', en: 'Effervescent tablets', it: 'Compresse effervescenti', es: 'Comprimidos efervescentes', fr: 'Comprimés effervescents', el: 'Αναβράζοντα δισκία', ru: 'Шипучие таблетки' },
    'Tabletten': { de: 'Tabletten', en: 'Tablets', it: 'Compresse', es: 'Comprimidos', fr: 'Comprimés', el: 'Δισκία', ru: 'Таблетки' },
    'Tablette': { de: 'Tablette', en: 'Tablet', it: 'Compressa', es: 'Comprimido', fr: 'Comprimé', el: 'Δισκίο', ru: 'Таблетка' },
    'Kapseln': { de: 'Kapseln', en: 'Capsules', it: 'Capsule', es: 'Cápsulas', fr: 'Gélules', el: 'Καψάκια', ru: 'Капсулы' },
    'Kapsel': { de: 'Kapsel', en: 'Capsule', it: 'Capsula', es: 'Cápsula', fr: 'Gélule', el: 'Καψάκιο', ru: 'Капсула' },
  };

  let out = pkg.replace(/Stk\./g, unitMap[targetLang] || 'pcs.');

  for (const [deForm, trans] of Object.entries(formMap)) {
    if (out.includes(deForm)) {
      out = out.split(deForm).join(trans[targetLang] || trans.en);
    }
  }

  return out;
}

/**
 * Synthesizes a standardized 5-section German monograph from structured medication data
 * if no full raw monograph text is available.
 */
export function synthesizeMonographFromStructured(med: StructuredMedicationInput): string {
  const name = med.name || 'Präparat';
  const activeSub = med.activeSubstance || name;
  const intro = `Hier ist die komplette Übersicht zu ${name} (${activeSub}) mit allen wichtigen Informationen zu Inhaltsstoffen, Dosierung, Nebenwirkungen, Kontraindikationen und Wechselwirkungen, übersichtlich zusammengefasst.`;

  const cat = med.category || 'Fachinformation';
  const sec1 = `📝 1. Wirkstoff und Inhaltsstoffe\n${name} gehört zur Wirkstoffgruppe: ${cat}.\nHauptwirkstoff: ${activeSub}.`;

  const sec2 = `💊 2. Dosierung & Anwendung\nDie Dosierung von ${name} (${activeSub}) wird von der behandelnden Ärztin oder dem Arzt streng individuell festgelegt.`;

  let nwContent = '';
  if (med.sideEffectsByFrequency && typeof med.sideEffectsByFrequency === 'object') {
    const parts: string[] = [];
    if (med.sideEffectsByFrequency.veryCommon?.length) parts.push(`Sehr häufig (≥ 1/10): ${med.sideEffectsByFrequency.veryCommon.join(', ')}.`);
    if (med.sideEffectsByFrequency.common?.length) parts.push(`Häufig (≥ 1/100 bis < 1/10): ${med.sideEffectsByFrequency.common.join(', ')}.`);
    if (med.sideEffectsByFrequency.uncommon?.length) parts.push(`Gelegentlich (≥ 1/1.000 bis < 1/100): ${med.sideEffectsByFrequency.uncommon.join(', ')}.`);
    if (med.sideEffectsByFrequency.rare?.length) parts.push(`Selten (≥ 1/10000 bis < 1/1000): ${med.sideEffectsByFrequency.rare.join(', ')}.`);
    if (med.sideEffectsByFrequency.veryRare?.length) parts.push(`Sehr selten (< 1/10000): ${med.sideEffectsByFrequency.veryRare.join(', ')}.`);
    if (parts.length > 0) nwContent = parts.join('\n');
  }
  if (!nwContent && Array.isArray(med.sideEffects) && med.sideEffects.length > 0) {
    nwContent = `Häufige Begleiterscheinungen:\n${med.sideEffects.join('; ')}.`;
  }
  const risks = med.warnings || '';
  const sec3 = `⚠️ 3. Nebenwirkungen\n${nwContent || 'Keine spezifischen Nebenwirkungen aufgeführt.'}\nBesondere Risiken & Warnhinweise:\n${risks}`;

  let sec4 = `🚫 4. Kontraindikationen (Gegenanzeigen)\nUnter bestimmten gesundheitlichen Bedingungen darf ${name} entweder gar nicht oder nur nach strenger ärztlicher Nutzen-Risiko-Abwägung angewendet werden.`;
  if (med.contraindications && typeof med.contraindications === 'object') {
    if (med.contraindications.absolute?.length) {
      sec4 += `\nAbsolute Gegenanzeigen (Anwendung ausgeschlossen):\n${med.contraindications.absolute.join(';\n')}.`;
    }
    if (med.contraindications.relative?.length) {
      sec4 += `\nRelative Gegenanzeigen (Besondere Vorsicht erforderlich):\n${med.contraindications.relative.join(';\n')}.`;
    }
  } else if (typeof med.contraindications === 'string' && med.contraindications) {
    sec4 += `\nAbsolute Gegenanzeigen (Anwendung ausgeschlossen):\n${med.contraindications}`;
  }

  let sec5 = `❌ 5. Gefährliche Wechselwirkungen\nDie Kombination von ${name} mit bestimmten anderen Substanzen kann die Wirkung unvorhersehbar verändern.`;
  if (Array.isArray(med.interactions) && med.interactions.length > 0) {
    sec5 += '\n' + med.interactions.map(i => `${i}.`).join('\n');
  }

  return `${intro}\n\n${sec1}\n\n${sec2}\n\n${sec3}\n\n${sec4}\n\n${sec5}`;
}

/**
 * Parses structured clinical data out of a monograph text.
 */
export function parseStructuredFromMonograph(monographText: string, targetLang?: LanguageCode): {
  activeSubstance: string;
  category: string;
  sideEffectsByFrequency: { veryCommon: string[]; common: string[]; uncommon: string[]; rare: string[]; veryRare: string[] };
  sideEffects: string[];
  interactions: string[];
  warnings: string;
  contraindications: { absolute: string[]; relative: string[] };
} {
  const result = {
    activeSubstance: '',
    category: '',
    sideEffectsByFrequency: { veryCommon: [] as string[], common: [] as string[], uncommon: [] as string[], rare: [] as string[], veryRare: [] as string[] },
    sideEffects: [] as string[],
    interactions: [] as string[],
    warnings: '',
    contraindications: { absolute: [] as string[], relative: [] as string[] }
  };

  if (!monographText) return result;

  const lines = monographText.split('\n').map(l => l.trim());
  let currentSec = 0;
  let inWarnings = false;
  let inAbsoluteContra = false;
  let inRelativeContra = false;

  for (const line of lines) {
    if (!line) continue;
    if (line.includes('1. ') || line.includes('📝')) { currentSec = 1; continue; }
    if (line.includes('2. ') || line.includes('💊')) { currentSec = 2; continue; }
    if (line.includes('3. ') || line.includes('⚠️')) { currentSec = 3; continue; }
    if (line.includes('4. ') || line.includes('🚫')) { currentSec = 4; inWarnings = false; continue; }
    if (line.includes('5. ') || line.includes('❌')) { currentSec = 5; inWarnings = false; continue; }

    if (currentSec === 1) {
      if (line.match(/(?:Hauptwirkstoff|Principio attivo principale|Main active|Действующее вещество|Δραστική ουσία|Principio activo principal|Substance active):\s*(.*)/i)) {
        result.activeSubstance = line.replace(/.*:\s*/, '').replace(/\.$/, '').trim();
      } else if (line.match(/(?:Wirkstoffgruppe|classe terapeutica|drug group|группе|ομάδα|clase terapéutica|classe thérapeutique|groupe pharmacologique):\s*(.*)/i)) {
        result.category = line.replace(/.*:\s*/, '').replace(/\.$/, '').trim();
      }
    } else if (currentSec === 3) {
      if (line.match(/^(?:Sehr häufig|Molto comune|Very common|Очень часто|Πολύ συχνές|Muy común|Muy frecuentes|Très fréquent).*?:\s*(.*)/i)) {
        const text = line.replace(/.*:\s*/, '').replace(/\.$/, '').trim();
        if (text) {
          result.sideEffectsByFrequency.veryCommon.push(text);
          result.sideEffects.push(...text.split(/,\s*/));
        }
      } else if (line.match(/^(?:Gelegentlich|Non comune|Uncommon|Нечасто|Όχι συχνές|Poco común|Poco frecuentes|Peu fréquent).*?:\s*(.*)/i)) {
        const text = line.replace(/.*:\s*/, '').replace(/\.$/, '').trim();
        if (text) {
          result.sideEffectsByFrequency.uncommon.push(text);
          result.sideEffects.push(...text.split(/,\s*/));
        }
      } else if (line.match(/^(?:Häufig|Comune|Common|Часто|Συχνές|Común|Frecuentes|Fréquent).*?:\s*(.*)/i)) {
        const text = line.replace(/.*:\s*/, '').replace(/\.$/, '').trim();
        if (text) {
          result.sideEffectsByFrequency.common.push(text);
          result.sideEffects.push(...text.split(/,\s*/));
        }
      } else if (line.match(/^(?:Selten|Raro|Rare|Редко|Σπάνιες|Raras).*?:\s*(.*)/i)) {
        const text = line.replace(/.*:\s*/, '').replace(/\.$/, '').trim();
        if (text) {
          result.sideEffectsByFrequency.rare.push(text);
          result.sideEffects.push(...text.split(/,\s*/));
        }
      } else if (line.match(/^(?:Sehr selten|Molto raro|Very rare|Очень редко|Πολύ σπάνιες|Muy raro|Muy raras|Très rare).*?:\s*(.*)/i)) {
        const text = line.replace(/.*:\s*/, '').replace(/\.$/, '').trim();
        if (text) {
          result.sideEffectsByFrequency.veryRare.push(text);
          result.sideEffects.push(...text.split(/,\s*/));
        }
      } else if (line.match(/(?:Risiken|avvertenze|risks|риски|κίνδυνοι|riesgos|risques|Mises en garde|Advertencias)/i)) {
        inWarnings = true;
      } else if (inWarnings && line.length > 5 && !line.startsWith('4.') && !line.startsWith('🚫')) {
        result.warnings = (result.warnings ? result.warnings + ' ' : '') + line;
      }
    } else if (currentSec === 4) {
      if (line.match(/(?:Absolute Gegenanzeigen|Absolute contraindications|Controindicazioni assolute|Contre-indications absolues|Contraindicaciones absolutas|Απόλυτες αντενδείξεις|Абсолютные противопоказания)/i)) {
        inRelativeContra = false;
        inAbsoluteContra = true;
        continue;
      }
      if (line.match(/(?:Relative Gegenanzeigen|Relative contraindications|Controindicazioni relative|Contre-indications relatives|Contraindicaciones relativas|Σχετικές αντενδείξεις|Относительные противопоказания)/i)) {
        inAbsoluteContra = false;
        inRelativeContra = true;
        continue;
      }
      const isIntro = line.startsWith('🚫') || line.includes('Bedingungen darf') || line.includes('conditions,') || line.includes('condizioni') || line.includes('conditions') || line.includes('condiciones');
      if (!isIntro && line.length > 2 && !line.startsWith('5.') && !line.startsWith('❌')) {
        const cleaned = line.replace(/^[•\-\*\s]+/, '').replace(/;$/, '').trim();
        if (cleaned) {
          if (inRelativeContra) {
            result.contraindications.relative.push(cleaned);
          } else {
            result.contraindications.absolute.push(cleaned);
          }
        }
      }
    } else if (currentSec === 5) {
      const isIntro = line.startsWith('❌') || line.endsWith(':') || /unvorhersehbar|imprevedibile|unpredictably|imprévisible|απρόβλεπτα|непредсказуемо/i.test(line);
      if (!isIntro && line.length > 3) {
        result.interactions.push(line.replace(/\.$/, '').trim());
      }
    }
  }

  return result;
}

/**
 * Localizes all structured medication fields for the compact view ("Vista compatta" / "Kompaktansicht")
 * into the user's active UI language synchronously using offline dictionary rules.
 */
export function localizeStructuredMedication(
  med: StructuredMedicationInput,
  targetLang: LanguageCode
): LocalizedStructuredData {
  if (!med) {
    return {
      name: '',
      activeSubstance: '',
      category: '',
      dosages: [],
      defaultDosages: [],
      packageSizes: [],
      sideEffectsByFrequency: { veryCommon: [], common: [], uncommon: [], rare: [], veryRare: [] },
      sideEffects: [],
      interactions: [],
      warnings: '',
      contraindications: { absolute: [], relative: [] }
    };
  }

  if (targetLang === 'de') {
    return {
      name: med.name,
      activeSubstance: med.activeSubstance,
      category: med.category,
      dosages: med.dosages,
      defaultDosages: med.defaultDosages,
      packageSizes: med.packageSizes,
      sideEffectsByFrequency: med.sideEffectsByFrequency,
      sideEffects: med.sideEffects,
      interactions: med.interactions,
      warnings: med.warnings,
      contraindications: med.contraindications,
      monographText: med.monographText
    };
  }

  // 1. If monograph text is present, translate or use localized monograph to extract structured content
  const baseMono = med.monographText || synthesizeMonographFromStructured(med);
  const localizedMono = baseMono ? localizeMonograph(baseMono, targetLang) : '';
  const parsedFromMono = localizedMono ? parseStructuredFromMonograph(localizedMono, targetLang) : null;

  // 2. Active substance & Category
  const activeSubstance = (parsedFromMono?.activeSubstance && parsedFromMono.activeSubstance.length > 0)
    ? parsedFromMono.activeSubstance
    : localizeClinicalText(med.activeSubstance, targetLang);

  const category = (parsedFromMono?.category && parsedFromMono.category.length > 0)
    ? parsedFromMono.category
    : localizeClinicalText(med.category, targetLang);

  // 3. Package sizes
  const packageSizes = med.packageSizes?.map(pkg => localizePackageSize(pkg, targetLang));

  // 4. Side effects by frequency
  const rawFreq = med.sideEffectsByFrequency || {};
  const sideEffectsByFrequency = {
    veryCommon: (parsedFromMono?.sideEffectsByFrequency.veryCommon && parsedFromMono.sideEffectsByFrequency.veryCommon.length > 0)
      ? parsedFromMono.sideEffectsByFrequency.veryCommon
      : (rawFreq.veryCommon?.map(t => localizeClinicalText(t, targetLang)) || []),
    common: (parsedFromMono?.sideEffectsByFrequency.common && parsedFromMono.sideEffectsByFrequency.common.length > 0)
      ? parsedFromMono.sideEffectsByFrequency.common
      : (rawFreq.common?.map(t => localizeClinicalText(t, targetLang)) || []),
    uncommon: (parsedFromMono?.sideEffectsByFrequency.uncommon && parsedFromMono.sideEffectsByFrequency.uncommon.length > 0)
      ? parsedFromMono.sideEffectsByFrequency.uncommon
      : (rawFreq.uncommon?.map(t => localizeClinicalText(t, targetLang)) || []),
    rare: (parsedFromMono?.sideEffectsByFrequency.rare && parsedFromMono.sideEffectsByFrequency.rare.length > 0)
      ? parsedFromMono.sideEffectsByFrequency.rare
      : (rawFreq.rare?.map(t => localizeClinicalText(t, targetLang)) || []),
    veryRare: (parsedFromMono?.sideEffectsByFrequency.veryRare && parsedFromMono.sideEffectsByFrequency.veryRare.length > 0)
      ? parsedFromMono.sideEffectsByFrequency.veryRare
      : (rawFreq.veryRare?.map(t => localizeClinicalText(t, targetLang)) || [])
  };

  // 5. Flat side effects
  const sideEffects = (parsedFromMono?.sideEffects && parsedFromMono.sideEffects.length > 0)
    ? parsedFromMono.sideEffects
    : (med.sideEffects?.map(t => localizeClinicalText(t, targetLang)) || []);

  // 6. Interactions
  const interactions = (parsedFromMono?.interactions && parsedFromMono.interactions.length > 0)
    ? parsedFromMono.interactions
    : (med.interactions?.map(t => localizeClinicalText(t, targetLang)) || []);

  // 7. Warnings
  const warnings = (parsedFromMono?.warnings && parsedFromMono.warnings.length > 0)
    ? parsedFromMono.warnings
    : localizeClinicalText(med.warnings, targetLang);

  // 8. Contraindications
  let contraindications = med.contraindications;
  if (parsedFromMono?.contraindications && (parsedFromMono.contraindications.absolute.length > 0 || parsedFromMono.contraindications.relative.length > 0)) {
    contraindications = parsedFromMono.contraindications;
  } else if (typeof contraindications === 'string') {
    contraindications = localizeClinicalText(contraindications, targetLang);
  } else if (contraindications && typeof contraindications === 'object') {
    contraindications = {
      absolute: contraindications.absolute?.map(t => localizeClinicalText(t, targetLang)),
      relative: contraindications.relative?.map(t => localizeClinicalText(t, targetLang))
    };
  }

  return {
    name: med.name,
    activeSubstance,
    category,
    dosages: med.dosages,
    defaultDosages: med.defaultDosages,
    packageSizes,
    sideEffectsByFrequency,
    sideEffects,
    interactions,
    warnings,
    contraindications,
    monographText: localizedMono || med.monographText
  };
}

/**
 * Asynchronously translates the structured medication data using the full AI service
 * and falls back to synchronous local dictionary if unavailable.
 */
export async function fetchLocalizedStructuredMedication(
  med: StructuredMedicationInput,
  targetLang: LanguageCode
): Promise<LocalizedStructuredData> {
  if (!med) return localizeStructuredMedication(med, targetLang);
  if (targetLang === 'de') return localizeStructuredMedication(med, 'de');

  try {
    const baseMono = med.monographText || synthesizeMonographFromStructured(med);
    const translatedMono = await fetchTranslatedMonograph(med.name || 'med', baseMono, targetLang);

    if (translatedMono && translatedMono.trim().length > 50) {
      const parsed = parseStructuredFromMonograph(translatedMono, targetLang);
      const packageSizes = med.packageSizes?.map(pkg => localizePackageSize(pkg, targetLang));

      return {
        name: med.name,
        activeSubstance: parsed.activeSubstance || localizeClinicalText(med.activeSubstance, targetLang),
        category: parsed.category || localizeClinicalText(med.category, targetLang),
        packageSizes,
        sideEffectsByFrequency: (parsed.sideEffectsByFrequency.veryCommon.length > 0 || parsed.sideEffectsByFrequency.common.length > 0 || parsed.sideEffectsByFrequency.uncommon.length > 0)
          ? parsed.sideEffectsByFrequency
          : localizeStructuredMedication(med, targetLang).sideEffectsByFrequency,
        sideEffects: parsed.sideEffects.length > 0 ? parsed.sideEffects : (med.sideEffects?.map(t => localizeClinicalText(t, targetLang)) || []),
        interactions: parsed.interactions.length > 0 ? parsed.interactions : (med.interactions?.map(t => localizeClinicalText(t, targetLang)) || []),
        warnings: parsed.warnings || localizeClinicalText(med.warnings, targetLang),
        contraindications: (parsed.contraindications.absolute.length > 0 || parsed.contraindications.relative.length > 0)
          ? parsed.contraindications
          : localizeStructuredMedication(med, targetLang).contraindications,
        monographText: translatedMono
      };
    }
  } catch (err) {
    console.warn('[MedicationLocalization] fetchLocalizedStructuredMedication fallback:', err);
  }

  return localizeStructuredMedication(med, targetLang);
}

