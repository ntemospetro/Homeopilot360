import { LanguageCode } from '../types';

export interface LocalizedConstitutionStrings {
  badgeText: string;
  constitutionLabel: string;
  clinicalImpact: string;
  dosageRecommendation: string;
  pharmacokineticMechanism: string;
}

export interface LocalizedLifestyleStrings {
  clinicalAction: string;
  summaryText: string;
  noInterference: string;
  abstinentLifestyle: string;
  pregnancyUrgentNotice: string;
}

export interface LocalizedMatrixRow {
  title: string;
  mechanism: string;
  maternalRisk: string;
  fetalRisk: string;
  warning: string;
}

export interface LocalizedReportTemplate {
  warningHeader: string;
  warningNotice: string;
  triageSectionTitle: string;
  holisticNotice: string;
  factorMedsTitle: string;
  factorConstitutionTitle: string;
  factorPregnancyTitle: string;
  factorLifestyleTitle: string;
  actionTitle: string;
  coreActionCritical: string;
  coreActionHigh: string;
  coreActionLow: string;
  matrixSectionTitle: string;
  tableHeader: string;
  diagnosticSectionTitle: string;
  diagnosticChecklistIntro: string;
  diagnosticQuestionsTitle: string;
  diagnosticLabTitle: string;
  diagnosticEmergencyTitle: string;
  questionComboRisk: (medsList: string) => string;
  questionDoseAdjust: (drugsList: string, weightKg: number) => string;
  questionPregnancySafety: (month: number, trimesterName: string) => string;
  questionStomachProtection: string;
  labCbcCoagulation: string;
  labLiverFunction: string;
  labPrenatalDoppler: string;
  emergencyGiBleeding: string;
  emergencyDyspneaSyncope: string;
  emergencyPregnancyVaginalBleeding: string;
  smokingText: (isSmoker: boolean) => string;
  alcoholText: (hasAlcohol: boolean) => string;
  notPregnantText: string;
  getTrimesterName: (trimester: number) => string;
}

export const LOCALIZED_REPORT_TEMPLATES: Record<LanguageCode, LocalizedReportTemplate> = {
  de: {
    warningHeader: '⚠️ WICHTIGER MEDIZINISCHER WARNHINWEIS',
    warningNotice: 'Diese KI-Analyse dient ausschließlich der Risiko-Früherkennung und Information. Sie stellt KEINE medizinische Beratung dar und ersetzt keinesfalls den Besuch bei einem Arzt oder Apotheker. Verändern oder setzen Sie Medikamente niemals eigenmächtig ab. Bei akuten Beschwerden ist sofort ein Arzt oder der Notruf zu kontaktieren.',
    triageSectionTitle: '1. KLINISCHE DRINGLICHKEIT (Triage)',
    holisticNotice: 'Ganzheitliche klinische Beurteilung aller erfassten Dimensionen:',
    factorMedsTitle: 'Medikamente & Interaktionspotenzial',
    factorConstitutionTitle: 'Konstitution & Dosierungsrelevanz',
    factorPregnancyTitle: 'Schwangerschafts- & Fötusstatus',
    factorLifestyleTitle: 'Lebensstil & Interaktionsfaktoren',
    actionTitle: 'Klinische Handlungsdringlichkeit:',
    coreActionCritical: 'Aufgrund kumulativer toxischer Synergien ist die Eigenmedikation unverzüglich zu stoppen und eine umgehende fachärztliche Abklärung einzuleiten.',
    coreActionHigh: 'Zeitnahe ärztliche Konsultation zur Dosisanpassung, Überprüfung von Kontraindikationen und Optimierung des Lebensstils zwingend angeraten.',
    coreActionLow: 'Kombination unter Einhaltung der empfohlenen Einnahmeabstände und regelmäßiger Routinekontrolle vertretbar.',
    matrixSectionTitle: '2. INTEGRATIVE RISIKO-MATRIX (Kombinations-Tabelle)',
    tableHeader: '| Analysierte Konstellation (Die Kombination) | Biologischer Wirkmechanismus (Was passiert im Körper?) | Spezifisches Risiko für die Mutter / den Patienten | Spezifisches Risiko für den Fötus (Schwangerschaft) | Priorisierte Warnung & Überwachungs-Parameter |\n| :--- | :--- | :--- | :--- | :--- |',
    diagnosticSectionTitle: '3. DIAGNOSTISCHER LEITFADEN FÜR DEN ARZTBESUCH',
    diagnosticChecklistIntro: 'Formuliere eine präzise, professionelle Checkliste für den Patienten, die er direkt zum Arzt mitnehmen kann:',
    diagnosticQuestionsTitle: 'Konkrete Fragen an den Arzt:',
    diagnosticLabTitle: 'Dringende Labor-/Untersuchungs-Anforderungen:',
    diagnosticEmergencyTitle: 'Symptome, bei denen sofort der Notruf gewählt werden muss:',
    questionComboRisk: (meds) => `Besteht bei meiner aktuellen Kombination aus ${meds} ein erhöhtes Risiko für Wechselwirkungen, Magenblutungen oder Dosisfehlanpassungen?`,
    questionDoseAdjust: (drugs, w) => `Ist bei meinem Körpergewicht von ${w} kg eine Dosisanpassung für ${drugs} erforderlich?`,
    questionPregnancySafety: (m, tri) => `Welche der aktuell eingenommenen Medikamente sind im ${m}. Monat (${tri}) uneingeschränkt sicher und welche müssen sofort umgestellt werden?`,
    questionStomachProtection: 'Gibt es für meine Symptome magenschonendere oder wirkstoffärmere Alternativen?',
    labCbcCoagulation: 'Kontrolle des großen Blutbildes, Gerinnungsparameter (INR, PTT) und Serum-Kreatinin / eGFR zur Nierenfunktionsprüfung.',
    labLiverFunction: 'Leberfunktionsdiagnostik (GOT, GPT, Gamma-GT, Bilirubin) zur Erfassung der enzymatischen Gesamtbelastung.',
    labPrenatalDoppler: 'Gezielte Pränatal-Sonographie mit Fruchtwassermengen-Bestimmung (AFI) und Doppler-Sonographie zur Überprüfung der plazentaren Perfusion.',
    emergencyGiBleeding: 'Teerstuhl (dunkel gefärbter Stuhl), kaffeesatzartiges Erbrechen oder plötzliche starke Bauch-/Magenschmerzen (Verdacht auf gastrointestinale Blutung/Ulkus).',
    emergencyDyspneaSyncope: 'Plötzliche Atemnot, akuter Schwindel, Ohnmacht oder Bewusstseinstrübung.',
    emergencyPregnancyVaginalBleeding: 'Vaginale Blutungen, vorzeitige Wehentätigkeit oder plötzliches Nachlassen der Kindsbewegungen.',
    smokingText: (s) => (s ? 'Raucher (Ja)' : 'Nichtraucher (Nein)'),
    alcoholText: (a) => (a ? 'Alkoholkonsum (Ja)' : 'Kein Alkoholkonsum (Nein)'),
    notPregnantText: 'Patient/in nicht schwanger; keine embryofetalen Teratogenitätsrisiken vorliegend.',
    getTrimesterName: (t) => t === 1 ? '1. Trimenon (Monat 1–3, SSW 1–12)' : t === 2 ? '2. Trimenon (Monat 4–6, SSW 13–24)' : '3. Trimenon (Monat 7–9, SSW 25–40)',
  },
  el: {
    warningHeader: '⚠️ ΣΗΜΑΝΤΙΚΗ ΙΑΤΡΙΚΗ ΠΡΟΕΙΔΟΠΟΙΗΣΗ',
    warningNotice: 'Αυτή η ανάλυση προορίζεται αποκλειστικά για την έγκαιρη ανίχνευση κινδύνου και την ενημέρωση. ΔΕΝ αποτελεί ιατρική συμβουλή και σε καμία περίπτωση δεν υποκαθιστά την επίσκεψη σε ιατρό ή φαρμακοποιό. Μην τροποποιείτε ή διακόπτετε ποτέ φάρμακα με δική σας πρωτοβουλία. Σε περίπτωση οξέων συμπτωμάτων, επικοινωνήστε αμέσως με ιατρό ή καλέστε το 166/112.',
    triageSectionTitle: '1. ΚΛΙΝΙΚΗ ΔΙΑΛΟΓΗ & ΕΠΕΙΓΟΝ (Triage)',
    holisticNotice: 'Ολιστική κλινική αξιολόγηση όλων των καταγεγραμμένων διαστάσεων:',
    factorMedsTitle: 'Φάρμακα & Δυναμικό αλληλεπίδρασης',
    factorConstitutionTitle: 'Σωματική διάπλαση & Συσχέτιση δοσολογίας',
    factorPregnancyTitle: 'Κατάσταση εγκυμοσύνης & Εμβρύου',
    factorLifestyleTitle: 'Παράγοντες τρόπου ζωής & Αλληλεπιδράσεις',
    actionTitle: 'Κλινική προτεραιότητα ενεργειών:',
    coreActionCritical: 'Λόγω σωρευτικών τοξικών συνεργειών, η αυτοθεραπεία πρέπει να διακοπεί άμεσα και απαιτείται κατεπείγουσα ειδική ιατρική εκτίμηση.',
    coreActionHigh: 'Συνιστάται επιτακτικά άμεση ιατρική συμβουλή για προσαρμογή της δόσης, έλεγχο αντενδείξεων και βελτιστοποίηση του τρόπου ζωής.',
    coreActionLow: 'Ο συνδυασμός είναι αποδεκτός με τήρηση των συνιστώμενων διαστημάτων λήψης και τακτικό έλεγχο ρουτίνας.',
    matrixSectionTitle: '2. ΟΛΟΚΛΗΡΩΜΕΝΟΣ ΠΙΝΑΚΑΣ ΚΙΝΔΥΝΩΝ (Πίνακας συνδυασμών)',
    tableHeader: '| Αναλυθείσα κατάσταση (Ο συνδυασμός) | Βιολογικός μηχανισμός δράσης (Τι συμβαίνει στο σώμα;) | Ειδικός κίνδυνος για τη μητέρα / τον ασθενή | Ειδικός κίνδυνος για το έμβρυο (Εγκυμοσύνη) | Προτεραιοποιημένη προειδοποίηση & Παράμετροι παρακολούθησης |\n| :--- | :--- | :--- | :--- | :--- |',
    diagnosticSectionTitle: '3. ΔΙΑΓΝΩΣΤΙΚΟΣ ΟΔΗΓΟΣ ΓΙΑ ΤΗΝ ΕΠΙΣΚΕΨΗ ΣΤΟΝ ΙΑΤΡΟ',
    diagnosticChecklistIntro: 'Συνοπτική, επαγγελματική λίστα ελέγχου για τον ασθενή, άμεσα αξιοποιήσιμη κατά την ιατρική επίσκεψη:',
    diagnosticQuestionsTitle: 'Συγκεκριμένες ερωτήσεις προς τον ιατρό:',
    diagnosticLabTitle: 'Επείγουσες εργαστηριακές/διαγνωστικές εξετάσεις:',
    diagnosticEmergencyTitle: 'Συμπτώματα που απαιτούν άμεση κλήση στο 166/112 (Επείγον):',
    questionComboRisk: (meds) => `Υπάρχει αυξημένος κίνδυνος αλληλεπιδράσεων, γαστρορραγίας ή λάθους δοσολογίας με τον τρέχοντα συνδυασμό ${meds};`,
    questionDoseAdjust: (drugs, w) => `Απαιτείται προσαρμογή της δόσης για τα ${drugs} με βάση το σωματικό μου βάρος (${w} kg);`,
    questionPregnancySafety: (m, tri) => `Ποια από τα τρέχοντα φάρμακα είναι απολύτως ασφαλή στον ${m}ο μήνα (${tri}) και ποια πρέπει να αντικατασταθούν άμεσα;`,
    questionStomachProtection: 'Υπάρχουν ηπιότερες για το στομάχι εναλλακτικές θεραπείες για τα συμπτώματά μου;',
    labCbcCoagulation: 'Γενική αίματος, έλεγχος πήξης (INR, aPTT) και κρεατινίνη ορού / eGFR για εκτίμηση της νεφρικής λειτουργίας.',
    labLiverFunction: 'Ηπατικός βιοχημικός έλεγχος (SGOT/AST, SGPT/ALT, γ-GT, χολερυθρίνη) για την καταγραφή του μεταβολικού φορτίου.',
    labPrenatalDoppler: 'Στοχευμένος προγεννητικός υπέρηχος με μέτρηση δείκτη αμνιακού υγρού (AFI) και υπερηχογράφημα Doppler μητριαίων αρτηριών.',
    emergencyGiBleeding: 'Μέλαινα κένωση (μαύρα κόπρανα), εμετός σαν ίζημα καφέ ή αιφνίδιος έντονος γαστρικός πόνος (υποψία γαστρεντερικής αιμορραγίας/έλκους).',
    emergencyDyspneaSyncope: 'Αιφνίδια δύσπνοια, οξύς ίλιγγος, συγκοπή ή διαταραχή επιπέδου συνείδησης.',
    emergencyPregnancyVaginalBleeding: 'Κολπική αιμορραγία, πρόωρες συσπάσεις μήτρας ή αιφνίδια ελάττωση των εμβρυϊκών κινήσεων.',
    smokingText: (s) => (s ? 'Καπνιστής (Ναι)' : 'Μη καπνιστής (Όχι)'),
    alcoholText: (a) => (a ? 'Κατανάλωση αλκοόλ (Ναι)' : 'Χωρίς κατανάλωση αλκοόλ (Όχι)'),
    notPregnantText: 'Ο/Η ασθενής δεν είναι σε εγκυμοσύνη· δεν υφίσταται εμβρυϊκός τερατογόνος κίνδυνος.',
    getTrimesterName: (t) => t === 1 ? '1ο Τρίμηνο (Μήνες 1–3, Εβδ. 1–12)' : t === 2 ? '2ο Τρίμηνο (Μήνες 4–6, Εβδ. 13–24)' : '3ο Τρίμηνο (Μήνες 7–9, Εβδ. 25–40)',
  },
  en: {
    warningHeader: '⚠️ IMPORTANT MEDICAL NOTICE',
    warningNotice: 'This analysis serves exclusively for early risk detection and information. It does NOT constitute medical advice and under no circumstances replaces consulting a physician or pharmacist. Never alter or discontinue medications on your own. In case of acute symptoms, immediately contact a physician or emergency services.',
    triageSectionTitle: '1. CLINICAL TRIAGE & URGENCY',
    holisticNotice: 'Holistic clinical evaluation of all recorded patient dimensions:',
    factorMedsTitle: 'Medications & Interaction Potential',
    factorConstitutionTitle: 'Constitution & Dosage Relevance',
    factorPregnancyTitle: 'Pregnancy & Fetal Status',
    factorLifestyleTitle: 'Lifestyle & Interaction Factors',
    actionTitle: 'Clinical Action Urgency:',
    coreActionCritical: 'Due to cumulative toxic synergies, self-medication must be stopped immediately and prompt specialist medical evaluation is mandatory.',
    coreActionHigh: 'Prompt medical consultation for dosage adjustment, review of contraindications, and lifestyle optimization is strongly advised.',
    coreActionLow: 'Combination acceptable adhering to recommended administration intervals and regular routine monitoring.',
    matrixSectionTitle: '2. INTEGRATIVE RISK MATRIX (Combination Table)',
    tableHeader: '| Analyzed Constellation (The Combination) | Biological Mechanism of Action (What happens in the body?) | Specific Risk for Mother / Patient | Specific Risk for Fetus (Pregnancy) | Prioritized Warning & Monitoring Parameters |\n| :--- | :--- | :--- | :--- | :--- |',
    diagnosticSectionTitle: '3. DIAGNOSTIC GUIDELINE FOR DOCTOR\'S VISIT',
    diagnosticChecklistIntro: 'Precise, professional checklist for the patient to bring directly to the medical appointment:',
    diagnosticQuestionsTitle: 'Specific questions for the doctor:',
    diagnosticLabTitle: 'Urgent laboratory/diagnostic orders:',
    diagnosticEmergencyTitle: 'Symptoms requiring immediate emergency call (911/112):',
    questionComboRisk: (meds) => `Is there an increased risk of drug interactions, gastrointestinal bleeding, or dosage mismatches with my current combination of ${meds}?`,
    questionDoseAdjust: (drugs, w) => `Is a dosage adjustment required for ${drugs} based on my body weight of ${w} kg?`,
    questionPregnancySafety: (m, tri) => `Which of my current medications are completely safe in month ${m} (${tri}) and which need immediate substitution?`,
    questionStomachProtection: 'Are there gentler alternatives for my stomach or lower-dose active ingredients available?',
    labCbcCoagulation: 'Complete blood count, coagulation profile (INR, aPTT), and serum creatinine / eGFR for renal function assessment.',
    labLiverFunction: 'Liver function diagnostic panel (AST, ALT, GGT, bilirubin) to evaluate hepatic metabolic clearance.',
    labPrenatalDoppler: 'Targeted prenatal ultrasound with amniotic fluid index (AFI) and uterine artery Doppler ultrasound.',
    emergencyGiBleeding: 'Melena (dark tarry stools), coffee-ground vomiting, or sudden severe abdominal pain (suspected GI hemorrhage/ulcer).',
    emergencyDyspneaSyncope: 'Sudden shortness of breath, acute dizziness, syncope, or altered mental status.',
    emergencyPregnancyVaginalBleeding: 'Vaginal bleeding, premature labor contractions, or sudden decrease in fetal movements.',
    smokingText: (s) => (s ? 'Smoker (Yes)' : 'Non-smoker (No)'),
    alcoholText: (a) => (a ? 'Alcohol consumption (Yes)' : 'No alcohol consumption (No)'),
    notPregnantText: 'Patient is not pregnant; no embryo-fetal teratogenicity risks present.',
    getTrimesterName: (t) => t === 1 ? '1st Trimester (Months 1–3, GW 1–12)' : t === 2 ? '2nd Trimester (Months 4–6, GW 13–24)' : '3rd Trimester (Months 7–9, GW 25–40)',
  },
  es: {
    warningHeader: '⚠️ AVISO MÉDICO IMPORTANTE',
    warningNotice: 'Este análisis sirve exclusivamente para la detección temprana de riesgos e información. NO constituye asesoramiento médico y en ningún caso sustituye la consulta médica o farmacéutica. Nunca modifique ni suspenda medicamentos por su cuenta. En caso de molestias agudas, contacte de inmediato a un médico o al servicio de urgencias.',
    triageSectionTitle: '1. URGENCIA CLÍNICA (Triaje)',
    holisticNotice: 'Evaluación clínica holística de todas las dimensiones registradas:',
    factorMedsTitle: 'Medicamentos y potencial de interacción',
    factorConstitutionTitle: 'Constitución y relevancia de dosificación',
    factorPregnancyTitle: 'Estado de embarazo y fetal',
    factorLifestyleTitle: 'Estilo de vida y factores de interacción',
    actionTitle: 'Urgencia de acción clínica:',
    coreActionCritical: 'Debido a sinergias tóxicas acumulativas, la automedicación debe suspenderse de inmediato y se requiere una valoración médica urgente.',
    coreActionHigh: 'Se recomienda encarecidamente una consulta médica oportuna para ajustar dosis, revisar contraindicaciones y optimizar el estilo de vida.',
    coreActionLow: 'Combinación aceptable respetando los intervalos de toma recomendados y con control rutinario regular.',
    matrixSectionTitle: '2. MATRIZ INTEGRAL DE RIESGO (Tabla de combinaciones)',
    tableHeader: '| Constelación analizada (La combinación) | Mecanismo de acción biológico (¿Qué ocurre en el cuerpo?) | Riesgo específico para la madre / paciente | Riesgo específico para el feto (Embarazo) | Advertencia priorizada y parámetros de monitorización |\n| :--- | :--- | :--- | :--- | :--- |',
    diagnosticSectionTitle: '3. GUÍA DIAGNÓSTICA PARA LA CONSULTA MÉDICA',
    diagnosticChecklistIntro: 'Lista de verificación profesional para el paciente para llevar directamente a la consulta médica:',
    diagnosticQuestionsTitle: 'Preguntas concretas para el médico:',
    diagnosticLabTitle: 'Pruebas de laboratorio / diagnósticas urgentes:',
    diagnosticEmergencyTitle: 'Síntomas que requieren llamar de inmediato a emergencias (112):',
    questionComboRisk: (meds) => `¿Existe un mayor riesgo de interacciones, hemorragia gastrointestinal o desajuste de dosis con mi combinación actual de ${meds}?`,
    questionDoseAdjust: (drugs, w) => `¿Se requiere un ajuste de dosis para ${drugs} con mi peso corporal de ${w} kg?`,
    questionPregnancySafety: (m, tri) => `¿Cuáles de mis medicamentos actuales son totalmente seguros en el mes ${m} (${tri}) y cuáles deben cambiarse de inmediato?`,
    questionStomachProtection: '¿Existen alternativas más protectoras del estómago para mis síntomas?',
    labCbcCoagulation: 'Hemograma completo, perfil de coagulación (INR, TTPa) y creatinina sérica / TFGe para evaluar la función renal.',
    labLiverFunction: 'Perfil de función hepática (GOT, GPT, GGT, bilirrubina) para evaluar la carga metabólica enzimática.',
    labPrenatalDoppler: 'Ecografía prenatal dirigida con índice de líquido amniótico (ILA) y ecografía Doppler de arterias uterinas.',
    emergencyGiBleeding: 'Melena (heces oscuras y pastosas), vómitos en posos de café o dolor abdominal agudo severo.',
    emergencyDyspneaSyncope: 'Dificultad respiratoria súbita, mareo agudo, síncope o alteración de la consciencia.',
    emergencyPregnancyVaginalBleeding: 'Sangrado vaginal, contracciones de parto prematuro o disminución brusca de los movimientos fetales.',
    smokingText: (s) => (s ? 'Fumador (Sí)' : 'No fumador (No)'),
    alcoholText: (a) => (a ? 'Consumo de alcohol (Sí)' : 'Sin consumo de alcohol (No)'),
    notPregnantText: 'La paciente no está embarazada; sin riesgos teratogénicos embriofetales.',
    getTrimesterName: (t) => t === 1 ? '1.er Trimestre (Meses 1–3, SG 1–12)' : t === 2 ? '2.º Trimestre (Meses 4–6, SG 13–24)' : '3.er Trimestre (Meses 7–9, SG 25–40)',
  },
  fr: {
    warningHeader: '⚠️ AVERTISSEMENT MÉDICAL IMPORTANT',
    warningNotice: 'Cette analyse sert exclusivement au dépistage précoce des risques et à l\'information. Elle ne constitue en AUCUN cas un avis médical et ne remplace nullement une consultation médicale ou pharmaceutique. Ne modifiez ni n\'arrêtez jamais vos médicaments de votre propre initiative. En cas de symptômes aigus, contactez immédiatement un médecin ou les urgences (15/112).',
    triageSectionTitle: '1. URGENCE CLINIQUE (Triage)',
    holisticNotice: 'Évaluation clinique globale de toutes les dimensions enregistrées :',
    factorMedsTitle: 'Médicaments & Potentiel d\'interaction',
    factorConstitutionTitle: 'Constitution & Pertinence du dosage',
    factorPregnancyTitle: 'Statut de grossesse & Fœtus',
    factorLifestyleTitle: 'Mode de vie & Facteurs d\'interaction',
    actionTitle: 'Urgence d\'action clinique :',
    coreActionCritical: 'En raison de synergies toxiques cumulatives, l\'automédication doit être immédiatement interrompue et un avis médical spécialisé urgent est obligatoire.',
    coreActionHigh: 'Une consultation médicale rapide pour ajustement de la dose, vérification des contre-indications et optimisation du mode de vie est vivement recommandée.',
    coreActionLow: 'Association acceptable en respectant les intervalles de prise recommandés et sous surveillance de routine régulière.',
    matrixSectionTitle: '2. MATRICE INTÉGRATIVE DU RISQUE (Tableau des associations)',
    tableHeader: '| Constellation analysée (L\'association) | Mécanisme d\'action biologique (Que se passe-t-il dans l\'organisme ?) | Risque spécifique pour la mère / le patient | Risque spécifique pour le fœtus (Grossesse) | Avertissement prioritaire et paramètres de surveillance |\n| :--- | :--- | :--- | :--- | :--- |',
    diagnosticSectionTitle: '3. GUIDE DIAGNOSTIQUE POUR LA CONSULTATION MÉDICALE',
    diagnosticChecklistIntro: 'Check-list professionnelle et précise à destination du patient pour sa consultation médicale :',
    diagnosticQuestionsTitle: 'Questions précises pour le médecin :',
    diagnosticLabTitle: 'Examens de laboratoire / diagnostiques urgents :',
    diagnosticEmergencyTitle: 'Symptômes nécessitant d\'appeler immédiatement le 15/112 (Urgences) :**',
    questionComboRisk: (meds) => `Existe-t-il un risque accru d'interactions, d'hémorragie digestive ou de mauvais dosage avec mon association actuelle de ${meds} ?`,
    questionDoseAdjust: (drugs, w) => `Un ajustement posologique est-il nécessaire pour ${drugs} compte tenu de mon poids de ${w} kg ?`,
    questionPregnancySafety: (m, tri) => `Quels médicaments parmi ceux que je prends sont totalement sûrs au ${m}e mois (${tri}) et lesquels doivent être remplacés d'urgence ?`,
    questionStomachProtection: 'Existe-t-il des alternatives plus protectrices de l\'estomac pour mes symptômes ?',
    labCbcCoagulation: 'Numération formule sanguine (NFS), bilan de coagulation (INR, TCA) et créatinine sérique / DFG pour l\'évaluation rénale.',
    labLiverFunction: 'Bilan hépatique complet (ASAT, ALAT, GGT, bilirubine) pour évaluer la clairance métabolique hépatique.',
    labPrenatalDoppler: 'Échographie prénatale ciblée avec indice de liquide amniotique (ILA) et Doppler des artères utérines.',
    emergencyGiBleeding: 'Méléna (selles noires comme du goudron), vomissements marc de café ou violentes douleurs épigastriques soudaines.',
    emergencyDyspneaSyncope: 'Dyspnée soudaine, vertiges aigus, syncope ou altération de la vigilance.',
    emergencyPregnancyVaginalBleeding: 'Saignements vaginaux, contractions utérines prématurées ou diminution soudaine des mouvements fœtaux.',
    smokingText: (s) => (s ? 'Fumeur (Oui)' : 'Non-fumeur (Non)'),
    alcoholText: (a) => (a ? 'Consommation d\'alcool (Oui)' : 'Pas de consommation d\'alcool (Non)'),
    notPregnantText: 'Patiente non enceinte ; absence de risque tératogène embryo-fœtal.',
    getTrimesterName: (t) => t === 1 ? '1er Trimestre (Mois 1–3, SA 1–12)' : t === 2 ? '2e Trimestre (Mois 4–6, SA 13–24)' : '3e Trimestre (Mois 7–9, SA 25–40)',
  },
  it: {
    warningHeader: '⚠️ AVVERTENZA MEDICA IMPORTANTE',
    warningNotice: 'Questa analisi serve esclusivamente per il rilevamento precoce dei rischi e a scopo informativo. NON costituisce consulenza medica e non sostituisce in alcun modo la visita da un medico o farmacista. Non modificare né sospendere mai i farmaci di propria iniziativa. In caso di sintomi acuti, contattare immediatamente un medico o il numero di emergenza.',
    triageSectionTitle: '1. URGENZA CLINICA (Triage)',
    holisticNotice: 'Valutazione clinica olistica di tutte le dimensioni registrate:',
    factorMedsTitle: 'Farmaci e potenziale di interazione',
    factorConstitutionTitle: 'Costituzione e rilevanza del dosaggio',
    factorPregnancyTitle: 'Stato di gravidanza e fetale',
    factorLifestyleTitle: 'Stile di vita e fattori di interazione',
    actionTitle: 'Priorità d\'intervento clinico:',
    coreActionCritical: 'A causa di sinergie tossiche cumulative, l\'automedicazione deve essere immediatamente sospesa ed è necessario un consulto medico urgente.',
    coreActionHigh: 'Si raccomanda vivamente un tempestivo consulto medico per l\'adeguamento del dosaggio, la verifica delle controindicazioni e l\'ottimizzazione dello stile di vita.',
    coreActionLow: 'Combinazione accettabile rispettando gli intervalli di assunzione raccomandati e regolari controlli di routine.',
    matrixSectionTitle: '2. MATRICE INTEGRATIVA DEL RISCHIO (Tabella combinazioni)',
    tableHeader: '| Costellazione analizzata (La combinazione) | Meccanismo d\'azione biologico (Cosa accade nell\'organismo?) | Rischio specifico per la madre / il paziente | Rischio specifico per il feto (Gravidanza) | Avvertenza prioritaria e parametri di monitoraggio |\n| :--- | :--- | :--- | :--- | :--- |',
    diagnosticSectionTitle: '3. GUIDA DIAGNOSTICA PER LA VISITA MEDICA',
    diagnosticChecklistIntro: 'Promemoria preciso e professionale da portare direttamente al medico curante:',
    diagnosticQuestionsTitle: 'Domande concrete per il medico:',
    diagnosticLabTitle: 'Esami di laboratorio / diagnostici urgenti:',
    diagnosticEmergencyTitle: 'Sintomi che richiedono la chiamata immediata al numero di emergenza (112):',
    questionComboRisk: (meds) => `Sussiste un rischio elevato di interazioni, emorragie gastrointestinali o dosaggi scorretti con la mia attuale combinazione di ${meds}?`,
    questionDoseAdjust: (drugs, w) => `È necessario un adeguamento del dosaggio per ${drugs} in base al mio peso corporeo di ${w} kg?`,
    questionPregnancySafety: (m, tri) => `Quali dei farmaci che assumo sono del tutto sicuri al ${m}° mese (${tri}) e quali devono essere sostituiti urgentemente?`,
    questionStomachProtection: 'Esistono alternative terapeutiche più tollerabili a livello gastrico?',
    labCbcCoagulation: 'Emocromo completo, parametri coagulativi (INR, aPTT) e creatinina sierica / eGFR per la funzionalità renale.',
    labLiverFunction: 'Profilo epatico completo (AST, ALT, GGT, bilirubina) per valutare il carico metabolico epatico.',
    labPrenatalDoppler: 'Ecografia prenatale mirata con indice di liquido amniotico (AFI) ed ecocolordoppler delle arterie uterine.',
    emergencyGiBleeding: 'Melena (feci nere picee), vomito caffeano o improvviso e violento dolore gastrico.',
    emergencyDyspneaSyncope: 'Dispnea improvvisa, vertigini acute, sincope o alterazione dello stato di coscienza.',
    emergencyPregnancyVaginalBleeding: 'Sanguinamento vaginale, contrazioni uterine premature o improvvisa riduzione dei movimenti fetali.',
    smokingText: (s) => (s ? 'Fumatore (Sì)' : 'Non fumatore (No)'),
    alcoholText: (a) => (a ? 'Consumo di alcol (Sì)' : 'Nessun consumo di alcol (No)'),
    notPregnantText: 'Paziente non in gravidanza; nessun rischio teratogeno embrio-fetale presente.',
    getTrimesterName: (t) => t === 1 ? '1° Trimestre (Mesi 1–3, SG 1–12)' : t === 2 ? '2° Trimestre (Mesi 4–6, SG 13–24)' : '3° Trimestre (Mesi 7–9, SG 25–40)',
  },
  ru: {
    warningHeader: '⚠️ ВАЖНОЕ МЕДИЦИНСКОЕ ПРЕДУПРЕЖДЕНИЕ',
    warningNotice: 'Этот анализ предназначен исключительно для раннего выявления рисков и информирования. Он НЕ является медицинской консультацией и ни в коем случае не заменяет визит к врачу или фармацевту. Никогда не изменяйте и не прекращайте прием лекарств самостоятельно. При острых симптомах немедленно обратитесь к врачу или вызовите скорую помощь (112).',
    triageSectionTitle: '1. КЛИНИЧЕСКАЯ СОРТИРОВКА (Триаж)',
    holisticNotice: 'Целостная клиническая оценка всех зафиксированных параметров:',
    factorMedsTitle: 'Препараты и потенциал взаимодействия',
    factorConstitutionTitle: 'Телосложение и значимость дозирования',
    factorPregnancyTitle: 'Статус беременности и плода',
    factorLifestyleTitle: 'Образ жизни и факторы взаимодействия',
    actionTitle: 'Клиническая срочность действий:',
    coreActionCritical: 'Из-за кумулятивных токсических синергий самолечение должно быть немедленно прекращено; требуется неотложная врачебная консультация.',
    coreActionHigh: 'Настоятельно рекомендуется скорейшая консультация врача для коррекции доз, проверки противопоказаний и модификации образа жизни.',
    coreActionLow: 'Комбинация допустима при соблюдении рекомендованных интервалов приема и регулярном рутинном контроле.',
    matrixSectionTitle: '2. ИНТЕГРАТИВНАЯ МАТРИЦА РИСКОВ (Таблица комбинаций)',
    tableHeader: '| Анализируемая комбинация | Биологический механизм действия (Что происходит в организме?) | Специфический риск для матери / пациента | Специфический риск для плода (Беременность) | Приоритетное предупреждение и параметры мониторинга |\n| :--- | :--- | :--- | :--- | :--- |',
    diagnosticSectionTitle: '3. ДИАГНОСТИЧЕСКОЕ РУКОВОДСТВО ДЛЯ ВИЗИТА К ВРАЧУ',
    diagnosticChecklistIntro: 'Четкий, профессиональный контрольный список для пациента перед визитом к врачу:',
    diagnosticQuestionsTitle: 'Конкретные вопросы к врачу:',
    diagnosticLabTitle: 'Неотложные лабораторные/диагностические исследования:',
    diagnosticEmergencyTitle: 'Симптомы, требующие немедленного вызова скорой помощи (112):',
    questionComboRisk: (meds) => `Есть ли повышенный риск лекарственных взаимодействий, желудочных кровотечений или неправильной дозы при приеме комбинации ${meds}?`,
    questionDoseAdjust: (drugs, w) => `Требуется ли коррекция дозы для ${drugs} с учетом моей массы тела ${w} кг?`,
    questionPregnancySafety: (m, tri) => `Какие из принимаемых препаратов полностью безопасны на ${m}-м месяце (${tri}), а какие требуют срочной замены?`,
    questionStomachProtection: 'Существуют ли более щадящие для желудка альтернативные препараты?',
    labCbcCoagulation: 'Общий анализ крови, коагулограмма (МНО, АЧТВ) и креатинин сыворотки / СКФ для оценки почечной функции.',
    labLiverFunction: 'Печеночные пробы (АЛТ, АСТ, ГГТ, билирубин) для оценки метаболической нагрузки на печень.',
    labPrenatalDoppler: 'Целевое пренатальное УЗИ с определением индекса амниотической жидкости (ИАЖ) и допплерографией маточных артерий.',
    emergencyGiBleeding: 'Мелена (черный дегтеобразный стул), рвота «кофейной гущей» или внезапная сильная боль в животе.',
    emergencyDyspneaSyncope: 'Внезапная одышка, резкое головокружение, обморок или спутанность сознания.',
    emergencyPregnancyVaginalBleeding: 'Кровянистые выделения из половых путей, преждевременные схватки или резкое снижение шевелений плода.',
    smokingText: (s) => (s ? 'Курящий (Да)' : 'Некурящий (Нет)'),
    alcoholText: (a) => (a ? 'Употребление алкоголя (Да)' : 'Без алкоголя (Нет)'),
    notPregnantText: 'Пациентка не беременна; риски тератогенности отсутствуют.',
    getTrimesterName: (t) => t === 1 ? '1-й триместр (месяцы 1–3, нед. 1–12)' : t === 2 ? '2-й триместр (месяцы 4–6, нед. 13–24)' : '3-й триместр (месяцы 7–9, нед. 25–40)',
  },
};

export function getLocalizedConstitution(
  type: 'low_mass' | 'high_mass' | 'normal',
  weightKg: number,
  heightCm: number,
  bmi: number | undefined,
  targetLang: LanguageCode
): LocalizedConstitutionStrings {
  const bmiStr = bmi ? `, BMI ${bmi} kg/m²` : '';

  switch (targetLang) {
    case 'el':
      if (type === 'low_mass') {
        return {
          badgeText: 'Έλεγχος μείωσης δόσης',
          constitutionLabel: `Χαμηλό σωματικό βάρος (${weightKg} kg / ${heightCm} cm)`,
          clinicalImpact: `Αυξημένος κίνδυνος σχετικής υπερδοσολογίας, επιταχυνόμενης τοξικότητας και αιμορραγικών ή κατασταλτικών επιπλοκών λόγω μειωμένου όγκου κατανομής στα ${weightKg} kg.`,
          dosageRecommendation: 'Προσαρμόστε τη δόση στη νεφρική κάθαρση (eGFR) και τη λιπόσαρκη μάζα σώματος.',
          pharmacokineticMechanism: `Μικρός όγκος κατανομής (Vd) στον εξωκυττάριο χώρο και στο λιπώδη ιστό.`
        };
      }
      if (type === 'high_mass') {
        return {
          badgeText: 'Ενδείκνυται προσαρμογή δόσης',
          constitutionLabel: `Υψηλό σωματικό βάρος / Παχυσαρκία (${weightKg} kg / ${heightCm} cm${bmiStr})`,
          clinicalImpact: `Μεταβεβλημένος όγκος κατανομής (Vd) και κάθαρσης: Κίνδυνος συσσώρευσης λιπόφιλων φαρμάκων ή υπερδοσολογίας υδρόφιλων φαρμάκων με δοσολογία βάσει ολικού βάρους.`,
          dosageRecommendation: `Υπολογίστε τη δοσολογία βάσει ιδανικού βάρους (IBW) και όχι συνολικού βάρους (${weightKg} kg).`,
          pharmacokineticMechanism: `Αυξημένος όγκος κατανομής λιπόφιλων φαρμάκων, παρατεταμένος χρόνος ημιζωής (t1/2).`
        };
      }
      return {
        badgeText: 'Επαρκής τυπική δοσολογία',
        constitutionLabel: `Κανονική σωματική διάπλαση (${weightKg} kg / ${heightCm} cm${bmiStr})`,
        clinicalImpact: 'Καμία ένδειξη μεταβεβλημένης φαρμακοκινητικής ή αναντιστοιχίας δοσολογίας στην τρέχουσα φαρμακευτική αγωγή.',
        dosageRecommendation: 'Τυπική δοσολογία σύμφωνα με τις επίσημες οδηγίες χωρίς ανάγκη τροποποίησης λόγω βάρους.',
        pharmacokineticMechanism: `Φυσιολογικός όγκος κατανομής και νεφρική κάθαρση εντός φυσιολογικών ορίων για ${weightKg} kg / ${heightCm} cm.`
      };

    case 'en':
      if (type === 'low_mass') {
        return {
          badgeText: 'Check dose reduction',
          constitutionLabel: `Low body weight (${weightKg} kg / ${heightCm} cm)`,
          clinicalImpact: `Increased risk of relative overdose, accelerated toxicity, and bleeding or sedation complications due to reduced distribution volume at ${weightKg} kg.`,
          dosageRecommendation: 'Adjust dose to renal clearance (eGFR) and lean body mass.',
          pharmacokineticMechanism: 'Reduced volume of distribution (Vd) in extracellular fluid and adipose tissue.'
        };
      }
      if (type === 'high_mass') {
        return {
          badgeText: 'Dosage adjustment indicated',
          constitutionLabel: `High body weight / Obesity (${weightKg} kg / ${heightCm} cm${bmiStr})`,
          clinicalImpact: 'Altered volume of distribution (Vd) and clearance: Risk of lipophilic drug accumulation or hydrophilic drug overdose if dosed by total body weight.',
          dosageRecommendation: `Calculate dosage using ideal body weight (IBW) rather than total body weight (${weightKg} kg).`,
          pharmacokineticMechanism: 'Expanded lipophilic distribution volume, extended elimination half-life (t1/2).'
        };
      }
      return {
        badgeText: 'Standard dosage adequate',
        constitutionLabel: `Standard constitution (${weightKg} kg / ${heightCm} cm${bmiStr})`,
        clinicalImpact: 'No evidence of altered pharmacokinetics or substance-specific dosage mismatch with current medication.',
        dosageRecommendation: 'Standard dosage per prescribing information acceptable without weight-related adjustment.',
        pharmacokineticMechanism: `Physiological volume of distribution and renal clearance within normal range for ${weightKg} kg / ${heightCm} cm.`
      };

    case 'es':
      if (type === 'low_mass') {
        return {
          badgeText: 'Revisar reducción de dosis',
          constitutionLabel: `Bajo peso corporal (${weightKg} kg / ${heightCm} cm)`,
          clinicalImpact: `Mayor riesgo de sobredosis relativa, toxicidad acelerada y complicaciones hemorrágicas o sedantes por bajo volumen de distribución a ${weightKg} kg.`,
          dosageRecommendation: 'Ajustar dosis según aclaramiento renal (TFGe) y masa corporal magra.',
          pharmacokineticMechanism: 'Volumen de distribución reducido (Vd) en líquido extracelular y tejido adiposo.'
        };
      }
      if (type === 'high_mass') {
        return {
          badgeText: 'Ajuste de dosis indicado',
          constitutionLabel: `Alto peso corporal / Obesidad (${weightKg} kg / ${heightCm} cm${bmiStr})`,
          clinicalImpact: 'Volumen de distribución (Vd) y aclaramiento alterados: riesgo de acumulación de fármacos lipófilos o sobredosis de fármacos hidrófilos con dosis por peso total.',
          dosageRecommendation: `Calcular dosis según peso ideal (IBW) y no peso total (${weightKg} kg).`,
          pharmacokineticMechanism: 'Volumen de distribución lipofílico ampliado, vida media de eliminación (t1/2) prolongada.'
        };
      }
      return {
        badgeText: 'Dosis estándar adecuada',
        constitutionLabel: `Constitución estándar (${weightKg} kg / ${heightCm} cm${bmiStr})`,
        clinicalImpact: 'Sin indicios de farmacocinética alterada o desajuste de dosis con la medicación actual.',
        dosageRecommendation: 'Dosificación estándar según ficha técnica sin ajuste de peso requerida.',
        pharmacokineticMechanism: `Volumen de distribución fisiológico y aclaramiento renal en rango normal para ${weightKg} kg / ${heightCm} cm.`
      };

    case 'fr':
      if (type === 'low_mass') {
        return {
          badgeText: 'Vérifier la réduction de dose',
          constitutionLabel: `Faible poids corporel (${weightKg} kg / ${heightCm} cm)`,
          clinicalImpact: `Risque accru de surdosage relatif, de toxicité accélérée et de complications hémorragiques ou sédatives dû au faible volume de distribution à ${weightKg} kg.`,
          dosageRecommendation: 'Adapter la posologie à la clairance rénale (DFG) et à la masse maigre.',
          pharmacokineticMechanism: 'Volume de distribution (Vd) réduit dans l\'espace extracellulaire et les tissus adipeux.'
        };
      }
      if (type === 'high_mass') {
        return {
          badgeText: 'Ajustement posologique indiqué',
          constitutionLabel: `Poids corporel élevé / Obésité (${weightKg} kg / ${heightCm} cm${bmiStr})`,
          clinicalImpact: 'Volume de distribution (Vd) et clairance modifiés : risque d\'accumulation des substances lipophiles ou de surdosage des substances hydrophiles.',
          dosageRecommendation: `Calculer la posologie selon le poids idéal (IBW) et non le poids total (${weightKg} kg).`,
          pharmacokineticMechanism: 'Volume de distribution accru pour les substances lipophiles, demi-vie d\'élimination prolongée.'
        };
      }
      return {
        badgeText: 'Posologie standard adéquate',
        constitutionLabel: `Constitution standard (${weightKg} kg / ${heightCm} cm${bmiStr})`,
        clinicalImpact: 'Aucun signe de pharmacocinétique altérée ni d\'inadéquation posologique avec la médication actuelle.',
        dosageRecommendation: 'Posologie standard selon le RCP acceptable sans ajustement lié au poids.',
        pharmacokineticMechanism: `Volume de distribution physiologique et clairance rénale dans les limites de la normale pour ${weightKg} kg / ${heightCm} cm.`
      };

    case 'it':
      if (type === 'low_mass') {
        return {
          badgeText: 'Verificare riduzione dosaggio',
          constitutionLabel: `Basso peso corporeo (${weightKg} kg / ${heightCm} cm)`,
          clinicalImpact: `Aumentato rischio di sovradosaggio relativo, tossicità accelerata e complicanze emorragiche o sedative per ridotto volume di distribuzione a ${weightKg} kg.`,
          dosageRecommendation: 'Adeguare la dose alla clearance renale (eGFR) e alla massa magra.',
          pharmacokineticMechanism: 'Volume di distribuzione (Vd) ridotto nello spazio extracellulare e tessuto adiposo.'
        };
      }
      if (type === 'high_mass') {
        return {
          badgeText: 'Adeguamento dosaggio indicato',
          constitutionLabel: `Peso corporeo elevato / Obesità (${weightKg} kg / ${heightCm} cm${bmiStr})`,
          clinicalImpact: 'Volume di distribuzione (Vd) e clearance alterati: rischio di accumulo di farmaci lipofili o sovradosaggio di farmaci idrofili.',
          dosageRecommendation: `Calcolare il dosaggio in base al peso ideale (IBW) e non al peso corporeo totale (${weightKg} kg).`,
          pharmacokineticMechanism: 'Volume di distribuzione lipofilo ampliato, emivita di eliminazione prolungata.'
        };
      }
      return {
        badgeText: 'Dosaggio standard adeguato',
        constitutionLabel: `Costituzione standard (${weightKg} kg / ${heightCm} cm${bmiStr})`,
        clinicalImpact: 'Nessuna evidenza di farmacocinetica alterata o inadeguatezza del dosaggio con la terapia attuale.',
        dosageRecommendation: 'Dosaggio standard secondo scheda tecnica accettabile senza correzione ponderale.',
        pharmacokineticMechanism: `Volume di distribuzione fisiologico e clearance renale nei limiti della norma per ${weightKg} kg / ${heightCm} cm.`
      };

    case 'ru':
      if (type === 'low_mass') {
        return {
          badgeText: 'Проверить снижение дозы',
          constitutionLabel: `Низкая масса тела (${weightKg} кг / ${heightCm} см)`,
          clinicalImpact: `Повышенный риск относительной передозировки, ускоренной токсичности и геморрагических или седативных осложнений из-за малого объема распределения при ${weightKg} кг.`,
          dosageRecommendation: 'Адаптировать дозу по почечному клиренсу (СКФ) и безжировой массе тела.',
          pharmacokineticMechanism: 'Уменьшенный объем распределения (Vd) во внеклеточной жидкости и жировой ткани.'
        };
      }
      if (type === 'high_mass') {
        return {
          badgeText: 'Показана коррекция дозы',
          constitutionLabel: `Высокая масса тела / Ожирение (${weightKg} кг / ${heightCm} см${bmiStr})`,
          clinicalImpact: 'Измененный объем распределения (Vd) и клиренс: риск кумуляции липофильных препаратов или передозировки гидрофильных веществ при дозировании по общей массе тела.',
          dosageRecommendation: `Рассчитывать дозу по идеальной массе тела (IBW), а не по общей массе (${weightKg} кг).`,
          pharmacokineticMechanism: 'Увеличенный объем распределения липофильных средств, удлиненный период полувыведения.'
        };
      }
      return {
        badgeText: 'Стандартная доза адекватна',
        constitutionLabel: `Стандартное телосложение (${weightKg} кг / ${heightCm} см${bmiStr})`,
        clinicalImpact: 'Нет признаков измененной фармакокинетики или несоответствия дозировок в текущей терапии.',
        dosageRecommendation: 'Стандартное дозирование согласно инструкции без весовой коррекции приемлемо.',
        pharmacokineticMechanism: `Физиологический объем распределения и почечный клиренс в пределах нормы для ${weightKg} кг / ${heightCm} см.`
      };

    case 'de':
    default:
      if (type === 'low_mass') {
        return {
          badgeText: 'Dosisreduktion prüfen',
          constitutionLabel: `Niedriges Körpergewicht (${weightKg} kg / ${heightCm} cm)`,
          clinicalImpact: `Erhöhtes Risiko für relative Überdosierung, beschleunigte Toxizität und Blutungs- bzw. Sedierungskomplikationen durch geringes Verteilungsvolumen bei ${weightKg} kg.`,
          dosageRecommendation: 'Dosis an renale Clearance (eGFR) und Magerkörpermasse anpassen.',
          pharmacokineticMechanism: 'Geringeres Verteilungsvolumen (Vd) im extrazellulären Raum und Fettgewebe.'
        };
      }
      if (type === 'high_mass') {
        return {
          badgeText: 'Dosierungsanpassung indiziert',
          constitutionLabel: `Hohes Körpergewicht / Adipositas (${weightKg} kg / ${heightCm} cm${bmiStr})`,
          clinicalImpact: 'Verändertes Verteilungsvolumen (Vd) und Clearance: Gefahr der Kumulation lipophiler Arzneistoffe bzw. Überdosierung hydrophiler Arzneistoffe bei Dosierung nach Gesamtkörpergewicht.',
          dosageRecommendation: `Dosierung nach Idealgewicht (IBW) berechnen, nicht nach Gesamtkörpergewicht (${weightKg} kg).`,
          pharmacokineticMechanism: 'Stark vergrößertes Verteilungsvolumen im Fettgewebe, verlängerte Eliminationshalbwertszeit (t1/2).'
        };
      }
      return {
        badgeText: 'Standard-Dosierung adäquat',
        constitutionLabel: `Standard-Konstitution (${weightKg} kg / ${heightCm} cm${bmiStr})`,
        clinicalImpact: 'Kein Hinweis auf veränderte Pharmakokinetik oder substanzspezifische Dosisfehlanpassung bei der aktuellen Medikation.',
        dosageRecommendation: 'Standarddosierung gemäß Fachinformation ohne gewichtsbedingte Korrektur vertretbar.',
        pharmacokineticMechanism: `Physiologisches Verteilungsvolumen und renale Clearance im Normbereich für ${weightKg} kg / ${heightCm} cm.`
      };
  }
}

export function getLocalizedLifestyleInteractions(
  drugs: Array<{ name: string; substance?: string; dosierung?: string }>,
  isSmoker: boolean,
  hasAlcohol: boolean,
  isPregnant: boolean,
  pregnancyMonth: number = 1,
  targetLang: LanguageCode = 'de'
) {
  const alcoholRisks: string[] = [];
  const smokingRisks: string[] = [];
  const pregnancyRisks: string[] = [];

  // 1. Pregnancy elevated priority risks
  if (isPregnant) {
    if (hasAlcohol) {
      switch (targetLang) {
        case 'el':
          pregnancyRisks.push(`🚨 ΑΛΚΟΟΛ ΣΤΗΝ ΕΓΚΥΜΟΣΥΝΗ (${pregnancyMonth}ος μήνας): Μέγιστη τερατογένεση! Δεν υπάρχει ασφαλής ποσότητα κατανάλωσης. Άμεσος κίνδυνος εμβρυϊκού συνδρόμου αλκοόλ (FASD), μη αναστρέψιμων δυσπλασιών του ΚΝΣ, μικροκεφαλίας και εμβρυϊκού θανάτου.`);
          break;
        case 'en':
          pregnancyRisks.push(`🚨 ALCOHOL IN PREGNANCY (Month ${pregnancyMonth}): Peak teratogenicity! There is no safe consumption limit. Acute risk of Fetal Alcohol Spectrum Disorder (FASD), irreversible CNS malformations, microcephaly, and fetal demise.`);
          break;
        case 'es':
          pregnancyRisks.push(`🚨 ALCOHOL EN EL EMBARAZO (Mes ${pregnancyMonth}): ¡Máxima teratogenicidad! No existe dosis segura. Riesgo agudo de síndrome alcohólico fetal (SAF), malformaciones irreversibles del SNC, microcefalia y muerte fetal.`);
          break;
        case 'fr':
          pregnancyRisks.push(`🚨 ALCOOL PENDANT LA GROSSESSE (${pregnancyMonth}e mois) : Tératogénicité maximale ! Aucune dose n'est sans danger. Risque aigu de syndrome d'alcoolisation fœtale (SAF), malformations irréversibles du SNC, microcéphalie et mort in utero.`);
          break;
        case 'it':
          pregnancyRisks.push(`🚨 ALCOL IN GRAVIDANZA (${pregnancyMonth}° mese): Massima teratogenicità! Nessuna quantità sicura. Pericolo di sindrome feto-alcolica (FASD), malformazioni irreversibili del SNC, microcefalia e morte fetale.`);
          break;
        case 'ru':
          pregnancyRisks.push(`🚨 АЛКОГОЛЬ ПРИ БЕРЕМЕННОСТИ (${pregnancyMonth}-й месяц): Наивысшая тератогенность! Безопасных доз нет. Опасность фетального алкогольного синдрома (ФАС), необратимых аномалий ЦНС, микроцефалии и гибели плода.`);
          break;
        case 'de':
        default:
          pregnancyRisks.push(`🚨 ALKOHOL IN DER SCHWANGERSCHAFT (${pregnancyMonth}. Monat): Höchste Teratogenität! Es gibt keine sichere Konsummenge. Akute Gefahr des Fetalen Alkoholsyndroms (FASD), irreversibler ZNS-Fehlbildungen, Mikrozephalie und Fruchttod.`);
          break;
      }
    }
    if (isSmoker) {
      switch (targetLang) {
        case 'el':
          pregnancyRisks.push(`🚨 ΚΑΠΝΙΣΜΑ ΣΤΗΝ ΕΓΚΥΜΟΣΥΝΗ (${pregnancyMonth}ος μήνας): Εμβρυϊκή υποξία λόγω μονοξειδίου του άνθρακα και αγγειοσυστολής από νικοτίνη· μαζικά αυξημένος κίνδυνος πλακουντιακής ανεπάρκειας, ενδομήτριας καθυστέρησης ανάπτυξης (IUGR), προωρότητας και SIDS.`);
          break;
        case 'en':
          pregnancyRisks.push(`🚨 SMOKING IN PREGNANCY (Month ${pregnancyMonth}): Fetal hypoxia from carbon monoxide and nicotine vasoconstriction; massively elevated risk of placental insufficiency, intrauterine growth restriction (IUGR), preterm birth, and SIDS.`);
          break;
        case 'es':
          pregnancyRisks.push(`🚨 TABAQUISMO EN EL EMBARAZO (Mes ${pregnancyMonth}): Hipoxia fetal por monóxido de carbono y vasoconstricción por nicotina; riesgo fuertemente aumentado de insuficiencia placentaria, CIR, parto prematuro y SMSL.`);
          break;
        case 'fr':
          pregnancyRisks.push(`🚨 TABAGISME PENDANT LA GROSSESSE (${pregnancyMonth}e mois) : Hypoxie fœtale par monoxyde de carbone et vasoconstriction nicotinique ; risque accru d'insuffisance placentaire, RCIU, prématurité et MSN.`);
          break;
        case 'it':
          pregnancyRisks.push(`🚨 FUMO IN GRAVIDANZA (${pregnancyMonth}° mese): Ipossia fetale da monossido di carbonio e vasocostrizione nicotinica; rischio accresciuto di insufficienza placentare, IUGR, parto prematuro e SIDS.`);
          break;
        case 'ru':
          pregnancyRisks.push(`🚨 КУРЕНИЕ ПРИ БЕРЕМЕННОСТИ (${pregnancyMonth}-й месяц): Гипоксия плода из-за угарного газа и никотиновой вазоконстрикции; резко повышен риск плацентарной недостаточности, ЗРП, преждевременных родов и СВДС.`);
          break;
        case 'de':
        default:
          pregnancyRisks.push(`🚨 RAUCHEN IN DER SCHWANGERSCHAFT (${pregnancyMonth}. Monat): Fetale Hypoxie durch Kohlenmonoxid und Nikotin-Vasokonstriktion; massiv erhöhtes Risiko für Plazentainsuffizienz, intrauterine Wachstumsretardierung (IUGR), Frühgeburtlichkeit und SIDS.`);
          break;
      }
    }
  }

  // 2. Direct Medication Interactions with Alcohol
  if (hasAlcohol) {
    for (const d of drugs) {
      const s = (d.substance || d.name).toLowerCase();
      if (s.includes('diazepam') || s.includes('lorazepam') || s.includes('zolpidem') || s.includes('oxazepam')) {
        if (targetLang === 'el') alcoholRisks.push(`Συνεργική καταστολή του ΚΝΣ με ${d.name}: Επαυξημένη ρύθμιση των υποδοχέων GABA-A με κίνδυνο αναπνευστικής καταστολής, κώματος και σοβαρής αταξίας βάδισης.`);
        else if (targetLang === 'en') alcoholRisks.push(`Synergistic CNS depression with ${d.name}: Potentiated GABA-A modulation with risk of respiratory depression, coma, and severe gait ataxia.`);
        else if (targetLang === 'es') alcoholRisks.push(`Depresión sinérgica del SNC con ${d.name}: Modulación potenciada del receptor GABA-A con riesgo de depresión respiratoria, coma y ataxia severa.`);
        else if (targetLang === 'fr') alcoholRisks.push(`Dépression synergique du SNC avec ${d.name} : Modulation amplifiée du récepteur GABA-A avec risque de dépression respiratoire, coma et ataxie sévère.`);
        else if (targetLang === 'it') alcoholRisks.push(`Depressione sinergica del SNC con ${d.name}: Modulazione potenziata dei recettori GABA-A con rischio di depressione respiratoria, coma e grave atassia.`);
        else if (targetLang === 'ru') alcoholRisks.push(`Синергическое угнетение ЦНС с ${d.name}: Потенцированная ГАМК-А-модуляция с риском угнетения дыхания, комы и тяжелой атаксии.`);
        else alcoholRisks.push(`Synergistische ZNS-Dämpfung mit ${d.name}: Potenzierte GABA-A-Modulation mit Gefahr von Atemdepression, Koma und schwerer Gangataxie.`);
      } else if (s.includes('ibuprofen') || s.includes('diclofenac') || s.includes('naproxen') || s.includes('acetylsalicyl') || s.includes('ass')) {
        if (targetLang === 'el') alcoholRisks.push(`Αθροιστική βλάβη του γαστρικού βλεννογόνου με ${d.name}: Ισχυρά αυξημένος κίνδυνος οξέων γαστροδωδεκαδακτυλικών ελκών και γαστρεντερικής αιμορραγίας.`);
        else if (targetLang === 'en') alcoholRisks.push(`Additive gastric mucosal injury with ${d.name}: Strongly increased risk of acute peptic ulcers and gastrointestinal bleeding.`);
        else if (targetLang === 'es') alcoholRisks.push(`Daño mucoso gástrico aditivo con ${d.name}: Riesgo fuertemente aumentado de úlceras agudas y hemorragias gastrointestinales.`);
        else if (targetLang === 'fr') alcoholRisks.push(`Lésion muqueuse gastrique additive avec ${d.name} : Risque fortement majoré d'ulcères gastriques aigus et d'hémorragies digestives.`);
        else if (targetLang === 'it') alcoholRisks.push(`Danno mucosale gastrico additivo con ${d.name}: Rischio fortemente aumentato di ulcere peptiche acute ed emorragie gastrointestinali.`);
        else if (targetLang === 'ru') alcoholRisks.push(`Аддитивное повреждение слизистой оболочки желудка с ${d.name}: Резко повышен риск острых язв и желудочно-кишечных кровотечений.`);
        else alcoholRisks.push(`Additive Magenschleimhautschädigung mit ${d.name}: Stark erhöhtes Risiko für akute Magen-Darm-Ulcera und gastrointestinale Blutungen.`);
      } else if (s.includes('marcumar') || s.includes('phenprocoumon') || s.includes('rivaroxaban') || s.includes('apixaban') || s.includes('clopidogrel')) {
        if (targetLang === 'el') alcoholRisks.push(`Μεταβεβλημένο προφίλ αιμορραγίας και κάθαρσης με ${d.name}: Αυξημένος κίνδυνος ανεξέλεγκτων αιμορραγιών.`);
        else if (targetLang === 'en') alcoholRisks.push(`Altered bleeding and clearance profile with ${d.name}: Increased hazard of uncontrolled hemorrhages.`);
        else if (targetLang === 'es') alcoholRisks.push(`Perfil de sangrado y aclaramiento alterado con ${d.name}: Mayor riesgo de hemorragias incontroladas.`);
        else if (targetLang === 'fr') alcoholRisks.push(`Profil hémorragique et clairance modifiés avec ${d.name} : Risque accru d'hémorragies incontrôlées.`);
        else if (targetLang === 'it') alcoholRisks.push(`Profilo emorragico e clearance alterati con ${d.name}: Rischio aumentato di emorragie incontrollate.`);
        else if (targetLang === 'ru') alcoholRisks.push(`Измененный профиль кровотечения и клиренса с ${d.name}: Повышенная опасность неконтролируемых кровотечений.`);
        else alcoholRisks.push(`Verändertes Blutungs- und Clearance-Profil mit ${d.name}: Gesteigerte Gefahr unkontrollierter Hämorrhagien.`);
      } else if (s.includes('metformin')) {
        if (targetLang === 'el') alcoholRisks.push(`Κρίσιμη αλληλεπίδραση με ${d.name}: Άμεσος κίνδυνος απειλητικής για τη ζωή γαλακτικής οξέωσης.`);
        else if (targetLang === 'en') alcoholRisks.push(`Critical interaction with ${d.name}: Acute danger of life-threatening lactic acidosis.`);
        else if (targetLang === 'es') alcoholRisks.push(`Interacción crítica con ${d.name}: Riesgo agudo de acidosis láctica potencialmente mortal.`);
        else if (targetLang === 'fr') alcoholRisks.push(`Interaction critique avec ${d.name} : Risque aigu d'acidose lactique potentiellement mortelle.`);
        else if (targetLang === 'it') alcoholRisks.push(`Interazione critica con ${d.name}: Pericolo acuto di acidosi lattica potenzialmente letale.`);
        else if (targetLang === 'ru') alcoholRisks.push(`Критическое взаимодействие с ${d.name}: Острая опасность жизнеугрожающего лактоацидоза.`);
        else alcoholRisks.push(`Kritische Interaktion mit ${d.name}: Akute Gefahr einer lebensbedrohlichen Laktatazidose.`);
      }
    }
  }

  // 3. Direct Medication Interactions with Smoking
  if (isSmoker) {
    for (const d of drugs) {
      const s = (d.substance || d.name).toLowerCase();
      if (s.includes('theophyllin') || s.includes('olanzapin') || s.includes('clozapin') || s.includes('fluvoxamin') || s.includes('duloxetin') || s.includes('propranolol')) {
        if (targetLang === 'el') smokingRisks.push(`Φαρμακοκινητική αλληλεπίδραση με ${d.name}: Οι πολυκυκλικοί αρωματικοί υδρογονάνθρακες στον καπνό επάγουν το CYP1A2 και μειώνουν τα θεραπευτικά επίπεδα κατά 40–50% (κίνδυνος θεραπευτικής αποτυχίας).`);
        else if (targetLang === 'en') smokingRisks.push(`Pharmacokinetic interaction with ${d.name}: Polycyclic aromatic hydrocarbons in tobacco smoke induce CYP1A2, lowering therapeutic levels by 40–50% (risk of therapeutic failure).`);
        else if (targetLang === 'es') smokingRisks.push(`Interacción farmacocinética con ${d.name}: Los hidrocarburos aromáticos policíclicos inducen el CYP1A2, reduciendo los niveles en un 40-50% (riesgo de fracaso terapéutico).`);
        else if (targetLang === 'fr') smokingRisks.push(`Interaction pharmacocinétique avec ${d.name} : Les HAP induisent le CYP1A2 et réduisent les concentrations de 40 à 50 % (risque d'échec thérapeutique).`);
        else if (targetLang === 'it') smokingRisks.push(`Interazione farmacocinetica con ${d.name}: Gli idrocarburi policiclici inducono il CYP1A2 riducendo i livelli del 40–50% (rischio di fallimento terapeutico).`);
        else if (targetLang === 'ru') smokingRisks.push(`Фармакокинетическое взаимодействие с ${d.name}: Полициклические ароматические углеводороды табачного дыма индуцируют CYP1A2 и снижают концентрацию на 40–50% (риск неэффективности терапии).`);
        else smokingRisks.push(`Pharmakokinetische Interaktion mit ${d.name}: Polyzyklische aromatische Kohlenwasserstoffe im Tabakrauch induzieren CYP1A2 und senken die Wirkspiegel um bis zu 40–50% (Gefahr des Therapieversagens).`);
      } else if (s.includes('ethinylestradiol') || s.includes('dienogest') || s.includes('pill') || s.includes('estro')) {
        if (targetLang === 'el') smokingRisks.push(`Σοβαρή αντένδειξη με ${d.name}: Μαζικά αυξημένος κίνδυνος θρομβοεμβολής, εμφράγματος του μυοκαρδίου και εγκεφαλικού επεισοδίου.`);
        else if (targetLang === 'en') smokingRisks.push(`Severe contraindication with ${d.name}: Massively elevated risk of thromboembolism, myocardial infarction, and stroke.`);
        else if (targetLang === 'es') smokingRisks.push(`Contraindicación grave con ${d.name}: Riesgo masivamente elevado de tromboembolismo, infarto de miocardio e ictus.`);
        else if (targetLang === 'fr') smokingRisks.push(`Contre-indication majeure avec ${d.name} : Risque fortement accru de thromboembolie, infarctus du myocarde et AVC.`);
        else if (targetLang === 'it') smokingRisks.push(`Grave controindicazione con ${d.name}: Rischio fortemente aumentato di tromboembolismo, infarto miocardico e ictus.`);
        else if (targetLang === 'ru') smokingRisks.push(`Тяжелое противопоказание с ${d.name}: Резко повышенный риск тромбоэмболии, инфаркта миокарда и инсульта.`);
        else smokingRisks.push(`Schwere Kontraindikation mit ${d.name}: Massiv erhöhtes Risiko für Thromboembolien, Myokardinfarkt und Schlaganfall.`);
      }
    }
  }

  const hasAlcoholInteraction = alcoholRisks.length > 0;
  const hasSmokingInteraction = smokingRisks.length > 0;
  const hasPregnancyRisk = pregnancyRisks.length > 0;

  const summaryParts: string[] = [];
  if (hasPregnancyRisk) {
    summaryParts.push(...pregnancyRisks);
  }
  if (hasAlcoholInteraction) {
    summaryParts.push(...alcoholRisks);
  } else if (hasAlcohol && !isPregnant) {
    if (targetLang === 'el') summaryParts.push('Καταγραφή κατανάλωσης αλκοόλ: Χωρίς άμεση φαρμακοδυναμική αλληλεπίδραση με τα τρέχοντα φάρμακα.');
    else if (targetLang === 'en') summaryParts.push('Alcohol consumption reported: No direct pharmacodynamic interaction with current medications identified.');
    else if (targetLang === 'es') summaryParts.push('Consumo de alcohol reportado: Sin interacción farmacodinámica directa con los fármacos actuales.');
    else if (targetLang === 'fr') summaryParts.push('Consommation d\'alcool signalée : Aucune interaction pharmacodynamique directe avec les médicaments actuels.');
    else if (targetLang === 'it') summaryParts.push('Consumo di alcol segnalato: Nessuna interazione farmacodinamica diretta con i farmaci attuali.');
    else if (targetLang === 'ru') summaryParts.push('Указано употребление алкоголя: Прямого фармакодинамического взаимодействия с текущими препаратами не выявлено.');
    else summaryParts.push('Alkoholkonsum angegeben: Keine direkte pharmakodynamische Wechselwirkung mit den aktuellen Wirkstoffen festgestellt.');
  }

  if (hasSmokingInteraction) {
    summaryParts.push(...smokingRisks);
  } else if (isSmoker && !isPregnant) {
    if (targetLang === 'el') summaryParts.push('Καπνιστής: Χωρίς άμεση φαρμακοκινητική αλληλεπίδραση με τα τρέχοντα φάρμακα.');
    else if (targetLang === 'en') summaryParts.push('Smoking reported: No direct pharmacokinetic interaction with current medications identified.');
    else if (targetLang === 'es') summaryParts.push('Tabaquismo reportado: Sin interacción farmacocinética directa con los fármacos actuales.');
    else if (targetLang === 'fr') summaryParts.push('Tabagisme signalé : Aucune interaction pharmacocinétique directe avec les médicaments actuels.');
    else if (targetLang === 'it') summaryParts.push('Fumo segnalato: Nessuna interazione farmacocinetica diretta con i farmaci attuali.');
    else if (targetLang === 'ru') summaryParts.push('Указано курение: Прямого фармакокинетического взаимодействия с текущими препаратами не выявлено.');
    else summaryParts.push('Rauchen angegeben: Keine direkte pharmakokinetische Wechselwirkung mit den aktuellen Wirkstoffen festgestellt.');
  }

  if (!hasAlcohol && !isSmoker && !isPregnant) {
    if (targetLang === 'el') summaryParts.push('Χωρίς κατανάλωση αλκοόλ ή νικοτίνης (κανένας σχετικός παράγοντας κινδύνου).');
    else if (targetLang === 'en') summaryParts.push('No alcohol or nicotine consumption reported (no substance-associated risk factors).');
    else if (targetLang === 'es') summaryParts.push('Sin consumo de alcohol ni nicotina reportado (sin factores de riesgo por sustancias).');
    else if (targetLang === 'fr') summaryParts.push('Aucune consommation d\'alcool ou de nicotine signalée (aucun facteur de risque lié aux substances).');
    else if (targetLang === 'it') summaryParts.push('Nessun consumo di alcol o nicotina segnalato (nessun fattore di rischio correlato).');
    else if (targetLang === 'ru') summaryParts.push('Употребление алкоголя и никотина отрицается (факторы риска отсутствуют).');
    else summaryParts.push('Kein Konsum von Alkohol oder Nikotin angegeben (keine substanzassoziierten Risikofaktoren).');
  }

  let clinicalAction = 'Keine lebensstilbezogenen Medikationskonflikte.';
  if (hasPregnancyRisk) {
    if (targetLang === 'el') clinicalAction = 'ΑΜΕΣΗ ΠΑΡΕΜΒΑΣΗ: Άμεση διακοπή νικοτίνης και αλκοόλ για την προστασία από σοβαρές εμβρυϊκές βλάβες (FASD, καθυστέρηση ανάπτυξης).';
    else if (targetLang === 'en') clinicalAction = 'IMMEDIATE INTERVENTION: Immediate cessation of nicotine and alcohol to protect against severe fetal damage (FASD, growth restriction).';
    else if (targetLang === 'es') clinicalAction = 'INTERVENCIÓN INMEDIATA: Suspensión inmediata de nicotina y alcohol para prevenir daños fetales graves (SAF, restricción del crecimiento).';
    else if (targetLang === 'fr') clinicalAction = 'INTERVENTION IMMÉDIATE : Arrêt immédiat de la nicotine et de l\'alcool pour prévenir de graves lésions fœtales (SAF, retard de croissance).';
    else if (targetLang === 'it') clinicalAction = 'INTERVENTO IMMEDIATO: Sospensione immediata di nicotina e alcol per prevenire gravi danni fetali (FASD, ritardo di crescita).';
    else if (targetLang === 'ru') clinicalAction = 'НЕОТЛОЖНОЕ ВМЕШАТЕЛЬСТВО: Немедленный отказ от никотина и алкоголя для защиты от тяжелых поражений плода (ФАС, задержка развития).';
    else clinicalAction = 'SOFORTIGE INTERVENTION: Umgehende Nikotin- und Alkoholabstinenz zum Schutz vor schweren Fötalschäden (FASD, Wachstumsretardierung).';
  } else if (hasAlcoholInteraction || hasSmokingInteraction) {
    if (targetLang === 'el') clinicalAction = 'Απαιτείται ιατρική καθοδήγηση για αυστηρά διαστήματα αποχής ή προσαρμογή δοσολογίας λόγω αλληλεπιδράσεων με τα φάρμακα.';
    else if (targetLang === 'en') clinicalAction = 'Medical consultation required for strict abstinence intervals or dose adjustment due to substance-specific interactions.';
    else if (targetLang === 'es') clinicalAction = 'Se requiere consulta médica para intervalos estrictos de abstinencia o ajuste de dosis por interacciones específicas.';
    else if (targetLang === 'fr') clinicalAction = 'Avis médical requis pour respecter des délais stricts d\'abstinence ou adapter la posologie en raison d\'interactions médicamenteuses.';
    else if (targetLang === 'it') clinicalAction = 'Necessaria consulenza medica per intervalli rigorosi di astensione o adeguamento del dosaggio per interazioni con i farmaci.';
    else if (targetLang === 'ru') clinicalAction = 'Требуется консультация врача для строгого соблюдения интервалов воздержания или коррекции доз из-за лекарственных взаимодействий.';
    else clinicalAction = 'Ärztliche Beratung zur Einhaltung strenger Karenzzeiten bzw. Dosisanpassung aufgrund substanzspezifischer Wechselwirkungen erforderlich.';
  } else {
    if (targetLang === 'el') clinicalAction = 'Δεν παρατηρούνται συγκρούσεις φαρμάκων σχετιζόμενες με τον τρόπο ζωής.';
    else if (targetLang === 'en') clinicalAction = 'No lifestyle-related medication conflicts.';
    else if (targetLang === 'es') clinicalAction = 'Sin conflictos de medicación relacionados con el estilo de vida.';
    else if (targetLang === 'fr') clinicalAction = 'Aucun conflit médicamenteux lié au mode de vie.';
    else if (targetLang === 'it') clinicalAction = 'Nessun conflitto farmacologico correlato allo stile di vita.';
    else if (targetLang === 'ru') clinicalAction = 'Конфликтов медикаментозной терапии с образом жизни не выявлено.';
  }

  return {
    hasAlcoholInteraction,
    hasSmokingInteraction,
    hasPregnancyRisk,
    alcoholRisks,
    smokingRisks,
    pregnancyRisks,
    summaryText: summaryParts.join(' '),
    clinicalAction,
  };
}

export function getLocalizedDrugPairingRow(
  d1: { name: string; dose: string; isNsaid?: boolean; isAnticoagulant?: boolean; isAceOrArb?: boolean; isSedative?: boolean },
  d2: { name: string; dose: string; isNsaid?: boolean; isAnticoagulant?: boolean; isAceOrArb?: boolean; isSedative?: boolean },
  isPregnant: boolean,
  weightKg: number,
  hasAlcohol: boolean,
  targetLang: LanguageCode = 'de'
): { title: string; mechanism: string; maternalRisk: string; fetalRisk: string; warning: string } {
  const title = `**${d1.name} (${d1.dose}) + ${d2.name} (${d2.dose})**`;

  if (d1.isNsaid && d2.isAnticoagulant) {
    switch (targetLang) {
      case 'el':
        return {
          title,
          mechanism: 'Συνεργική αναστολή της συσσώρευσης αιμοπεταλίων (COX-1) σε συνδυασμό με συστηματική αντιπηκτική αγωγή· αθροιστική βλάβη του γαστρικού βλεννογόνου.',
          maternalRisk: 'Εξαιρετικά υψηλός κίνδυνος απειλητικών για τη ζωή γαστρεντερικών αιμορραγιών, γαστρικής διάτρησης και νεφρικής απορρύθμισης.',
          fetalRisk: isPregnant ? 'Μαζικός κίνδυνος εμβρυϊκής αιμορραγίας, οπισθοπλακουντιακού αιματώματος και πρόωρης αποκόλλησης πλακούντα.' : 'Δεν εφαρμόζεται.',
          warning: 'ΑΜΕΣΗ ΙΑΤΡΙΚΗ ΠΑΡΕΜΒΑΣΗ: Έλεγχος λειτουργίας αιμοπεταλίων, αιμοσφαιρίνης (Hb), αιματοκρίτη, έλεγχος για μέλαινα κένωση.',
        };
      case 'en':
        return {
          title,
          mechanism: 'Synergistic inhibition of platelet aggregation (COX-1) combined with systemic anticoagulation; additive gastric mucosal injury.',
          maternalRisk: 'Extremely high risk of life-threatening gastrointestinal hemorrhage, gastric perforation, and renal decompensation.',
          fetalRisk: isPregnant ? 'Massive fetal hemorrhage risk, retroplacental hematoma, and premature placental abruption.' : 'Not applicable.',
          warning: 'IMMEDIATE MEDICAL INTERVENTION: Platelet function, Hb level, hematocrit, melena screening.',
        };
      case 'es':
        return {
          title,
          mechanism: 'Inhibición sinérgica de la agregación plaquetaria (COX-1) combinada con anticoagulación sistémica; daño mucoso gástrico aditivo.',
          maternalRisk: 'Riesgo extremadamente elevado de hemorragia digestiva potencialmente mortal, perforación gástrica y descompensación renal.',
          fetalRisk: isPregnant ? 'Riesgo masivo de hemorragia fetal, hematoma retroplacentario y desprendimiento prematuro de placenta.' : 'No aplicable.',
          warning: 'INTERVENCIÓN MÉDICA INMEDIATA: Función plaquetaria, hemoglobina, hematocrito y detección de melenas.',
        };
      case 'fr':
        return {
          title,
          mechanism: 'Inhibition synergique de l\'agrégation plaquettaire (COX-1) associée à une anticoagulation systémique ; lésion muqueuse gastrique additive.',
          maternalRisk: 'Risque extrêmement élevé d\'hémorragie digestive menaçant le pronostic vital, perforation gastrique et décompensation rénale.',
          fetalRisk: isPregnant ? 'Risque massif d\'hémorragie fœtale, hématome rétroplacentaire et décollement prématuré du placenta.' : 'Non applicable.',
          warning: 'INTERVENTION MÉDICALE IMMÉDIATE : Fonction plaquettaire, taux d\'Hb, hématocrite, dépistage de méléna.',
        };
      case 'it':
        return {
          title,
          mechanism: 'Inibizione sinergica dell\'aggregazione piastrinica (COX-1) combinata con anticoagulazione sistemica; danno mucosale gastrico additivo.',
          maternalRisk: 'Rischio estremamente elevato di emorragia gastrointestinale potenzialmente letale, perforazione gastrica e scompensazione renale.',
          fetalRisk: isPregnant ? 'Rischio massivo di emorragia fetale, ematoma retroplacentare e distacco prematuro della placenta.' : 'Non applicabile.',
          warning: 'INTERVENTO MEDICO IMMEDIATO: Funzionalità piastrinica, emoglobina, ematocrito e monitoraggio melena.',
        };
      case 'ru':
        return {
          title,
          mechanism: 'Синергическое ингибирование агрегации тромбоцитов (ЦОГ-1) в сочетании с антикоагуляцией; аддитивное поражение слизистой желудка.',
          maternalRisk: 'Крайне высокий риск жизнеугрожающих желудочно-кишечных кровотечений, перфорации желудка и острой почечной декомпенсации.',
          fetalRisk: isPregnant ? 'Массивный риск фетальных кровотечений, ретроплацентарной гематомы и преждевременной отслойки плаценты.' : 'Не применимо.',
          warning: 'НЕОТЛОЖНОЕ ВРАЧЕБНОЕ ВМЕШАТЕЛЬСТВО: Функция тромбоцитов, уровень Hb, гематокрит, скрининг мелены.',
        };
      case 'de':
      default:
        return {
          title,
          mechanism: 'Synergistische Hemmung der Thrombozytenaggregation (COX-1) gepaart mit systemischer Antikoagulation; additive Magenmucosaschädigung.',
          maternalRisk: 'Extrem hohes Risiko für lebensbedrohliche gastrointestinale Blutungen, Magenperforation und renale Dekompensation.',
          fetalRisk: isPregnant ? 'Massives fetales Blutungsrisiko, Retroplazentares Hämatom und vorzeitige Plazentalösung.' : 'Nicht zutreffend.',
          warning: 'SOFORTIGE ÄRZTLICHE INTERVENTION: Thrombozytenfunktion, Hb-Wert, Hämatokrit, Teerstuhl-Screening.',
        };
    }
  }

  if (d1.isNsaid && d2.isAceOrArb) {
    switch (targetLang) {
      case 'el':
        return {
          title,
          mechanism: 'Συνδυασμένη διαταραχή της νεφρικής αυτορρύθμισης (τα ΜΣΑΦ συστέλλουν το προσαγωγό αρτηρίδιο μέσω αναστολής προσταγλανδινών, οι αναστολείς ΜΕΑ διαστέλλουν το απαγωγό).',
          maternalRisk: 'Οξεία νεφρική ανεπάρκεια (κίνδυνος Triple Whammy) και ανεξέλεγκτη άνοδος της αρτηριακής πίεσης παρά την αντιυπερτασική αγωγή.',
          fetalRisk: isPregnant ? 'Ολιγοϋδράμνιο (έλλειψη αμνιακού υγρού) λόγω νεφρικής αγενεσίας/ανεπάρκειας του εμβρύου.' : 'Δεν εφαρμόζεται.',
          warning: 'Στενή παρακολούθηση κρεατινίνης ορού, GFR, καλίου και καθημερινή μέτρηση αρτηριακής πίεσης.',
        };
      case 'en':
        return {
          title,
          mechanism: 'Combined impairment of renal autoregulation (NSAIDs constrict the afferent arteriole via PG inhibition, ACE inhibitors dilate the efferent arteriole).',
          maternalRisk: 'Acute renal failure (Triple Whammy risk) and uncontrolled blood pressure increase despite antihypertensive therapy.',
          fetalRisk: isPregnant ? 'Oligohydramnios (lack of amniotic fluid) due to fetal renal agenesis/dysfunction.' : 'Not applicable.',
          warning: 'Close monitoring of serum creatinine, eGFR, potassium levels, and daily blood pressure measurement.',
        };
      case 'es':
        return {
          title,
          mechanism: 'Alteración combinada de la autorregulación renal (los AINE constriñen la arteriola aferente vía inhibición de PG, los IECA dilatan la eferente).',
          maternalRisk: 'Insuficiencia renal aguda (riesgo de Triple Whammy) y aumento descontrolado de la presión arterial.',
          fetalRisk: isPregnant ? 'Oligohidramnios por agenesia o disfunción renal fetal.' : 'No aplicable.',
          warning: 'Monitorización estrecha de creatinina sérica, FG, potasio y control tensional diario.',
        };
      case 'fr':
        return {
          title,
          mechanism: 'Altération combinée de l\'autorégulation rénale (les AINS vasoconstricteurs de l\'artériole afférente, les IEC vasodilatateurs de l\'artériole efférente).',
          maternalRisk: 'Insuffisance rénale aiguë (risque de Triple Whammy) et poussée hypertensive malgré le traitement.',
          fetalRisk: isPregnant ? 'Oligoamnios par agénésie ou défaillance rénale fœtale.' : 'Non applicable.',
          warning: 'Surveillance étroite de la créatinine sérique, DFG, kaliémie et mesure quotidienne de la PA.',
        };
      case 'it':
        return {
          title,
          mechanism: 'Compromissione combinata dell\'autoregolazione renale (i FANS vasocostringono l\'arteriola afferente, gli ACE-inibitori dilatano l\'efferente).',
          maternalRisk: 'Insufficienza renale acuta (rischio Triple Whammy) e mancato controllo pressorio.',
          fetalRisk: isPregnant ? 'Oligo-idramnios dovuto ad agenesia o insufficienza renale fetale.' : 'Non applicabile.',
          warning: 'Monitoraggio attento di creatinina sierica, eGFR, potassiemia e misurazione quotidiana della PA.',
        };
      case 'ru':
        return {
          title,
          mechanism: 'Комбинированное нарушение почечной авторегуляции (НПВП сужают приносящую артериолу, ингибиторы АПФ расширяют выносящую).',
          maternalRisk: 'Острая почечная недостаточность (синдром Triple Whammy) и резистентная артериальная гипертензия.',
          fetalRisk: isPregnant ? 'Олигогидрамнион (маловодие) вследствие почечной дисфункции плода.' : 'Не применимо.',
          warning: 'Тщательный мониторинг сывороточного креатинина, СКФ, калия и ежедневный контроль АД.',
        };
      case 'de':
      default:
        return {
          title,
          mechanism: 'Kombinierte Störung der renalen Autoregulation (NSAR verengen Vas afferens via Prostaglandin-Hemmung, ACE-Hemmer erweitern Vas efferens).',
          maternalRisk: 'Akutes Nierenversagen (Triple Whammy Risiko) und unkontrollierter Blutdruckanstieg trotz Antihypertensivum.',
          fetalRisk: isPregnant ? 'Oligohydramnie (Mangel an Fruchtwasser) durch Nierenagenesie/-insuffizienz des Fötus.' : 'Nicht zutreffend.',
          warning: 'Engmaschige Überwachung von Serum-Kreatinin, GFR, Kaliumspiegel und tägliche Blutdruckmessung.',
        };
    }
  }

  if (d1.isSedative && (d2.isSedative || hasAlcohol)) {
    switch (targetLang) {
      case 'el':
        return {
          title,
          mechanism: 'Συνεργική αλλοστερική ρύθμιση υποδοχέων GABA-A και καταστολή του ΚΝΣ.',
          maternalRisk: 'Σοβαρή αναπνευστική καταστολή, βραδυκαρδία, απώλεια συνείδησης και επικίνδυνη αταξία βάδισης.',
          fetalRisk: isPregnant ? 'Σύνδρομο χαλαρού νεογνού (Floppy Infant Syndrome), νεογνική αναπνευστική δυσχέρεια και σύνδρομο στέρησης.' : 'Δεν εφαρμόζεται.',
          warning: 'Παρακολούθηση αναπνευστικού ρυθμού και κορεσμού οξυγόνου (SpO2)· απαγόρευση οδήγησης.',
        };
      case 'en':
        return {
          title,
          mechanism: 'Synergistic allosteric GABA-A receptor modulation and central nervous system depression.',
          maternalRisk: 'Severe respiratory depression, bradycardia, loss of consciousness, and dangerous gait ataxia.',
          fetalRisk: isPregnant ? 'Floppy infant syndrome, neonatal respiratory insufficiency, and withdrawal syndrome.' : 'Not applicable.',
          warning: 'Monitor respiratory rate and SpO2; avoid driving vehicles or operating machinery.',
        };
      case 'es':
        return {
          title,
          mechanism: 'Modulación alostérica sinérgica de los receptores GABA-A y depresión del SNC.',
          maternalRisk: 'Depresión respiratoria grave, bradicardia, pérdida de conciencia y ataxia motora peligrosa.',
          fetalRisk: isPregnant ? 'Síndrome del lactante hipotónico (floppy infant), dificultad respiratoria neonatal y abstinencia.' : 'No aplicable.',
          warning: 'Vigilar frecuencia respiratoria y saturación de oxígeno (SpO2); evitar la conducción.',
        };
      case 'fr':
        return {
          title,
          mechanism: 'Modulation allostérique synergique des récepteurs GABA-A et dépression du SNC.',
          maternalRisk: 'Dépression respiratoire sévère, bradycardie, perte de conscience et ataxie majeure de la marche.',
          fetalRisk: isPregnant ? 'Syndrome du bébé mou (floppy infant), détresse respiratoire néonatale et sevrage.' : 'Non applicable.',
          warning: 'Surveiller la fréquence respiratoire et la SpO2 ; interdiction stricte de conduire des véhicules.',
        };
      case 'it':
        return {
          title,
          mechanism: 'Modulazione allosterica sinergica dei recettori GABA-A e depressione del SNC.',
          maternalRisk: 'Grave depressione respiratoria, bradicardia, perdita di coscienza e pericolosa atassia deambulatoria.',
          fetalRisk: isPregnant ? 'Sindrome del bambino ipotonico (floppy infant), insufficienza respiratoria neonatale e astinenza.' : 'Non applicabile.',
          warning: 'Monitorare frequenza respiratoria e saturazione (SpO2); astenersi dalla guida di autoveicoli.',
        };
      case 'ru':
        return {
          title,
          mechanism: 'Синергическая аллостерическая модуляция ГАМК-А-рецепторов и глубокое угнетение ЦНС.',
          maternalRisk: 'Тяжелое угнетение дыхания, брадикардия, потеря сознания и опасная атаксия походки.',
          fetalRisk: isPregnant ? 'Синдром вялого ребенка («floppy infant»), неонатальная дыхательная недостаточность и синдром отмены.' : 'Не применимо.',
          warning: 'Мониторинг частоты дыхания и сатурации (SpO2); категорический запрет на вождение транспорта.',
        };
      case 'de':
      default:
        return {
          title,
          mechanism: 'Synergistische allosterische GABA-A-Rezeptormodulation und ZNS-Dämpfung.',
          maternalRisk: 'Schwere Atemdepression, Bradykardie, Bewusstseinsverlust und gefährliche Gangataxie.',
          fetalRisk: isPregnant ? 'Floppy-Infant-Syndrom, neonatale Ateminsuffizienz und Entzugssyndrom.' : 'Nicht zutreffend.',
          warning: 'Atemfrequenz und Sauerstoffsättigung (SpO2) überwachen; kein Führen von Fahrzeugen.',
        };
    }
  }

  // Default cross interaction
  switch (targetLang) {
    case 'el':
      return {
        title,
        mechanism: `Φαρμακοδυναμική αλληλεπίδραση και ηπατική αποβολή (ένζυμα CYP) των ${d1.name} και ${d2.name}.`,
        maternalRisk: `Επαυξημένο φορτίο ήπατος, γαστρικού βλεννογόνου και νεφρικής διήθησης σε σωματικό βάρος ${weightKg} kg.`,
        fetalRisk: isPregnant ? 'Διαπερατότητα πλακούντα και των δύο φαρμάκων· επαυξημένη τοξική επίδραση στους εμβρυϊκούς ιστούς.' : 'Δεν εφαρμόζεται (χωρίς κύηση).',
        warning: 'Τακτικός έλεγχος αρτηριακής πίεσης, ηπατικών ενζύμων (SGOT, SGPT) και κρεατινίνης ορού.',
      };
    case 'en':
      return {
        title,
        mechanism: `Pharmacodynamic interaction and hepatic elimination (CYP enzymes) of ${d1.name} and ${d2.name}.`,
        maternalRisk: `Additive metabolic stress on liver, gastric mucosa, and renal filtration at ${weightKg} kg body weight.`,
        fetalRisk: isPregnant ? 'Placental passage of both active substances; potential adverse impact on embryonic tissues.' : 'Not applicable (no pregnancy present).',
        warning: 'Regular monitoring of blood pressure, transaminases (AST, ALT), and serum creatinine.',
      };
    case 'es':
      return {
        title,
        mechanism: `Interacción farmacodinámica y eliminación hepática (enzimas CYP) de ${d1.name} y ${d2.name}.`,
        maternalRisk: `Carga metabólica aditiva en hígado, mucosa gástrica y filtración renal para ${weightKg} kg de peso corporal.`,
        fetalRisk: isPregnant ? 'Paso placentario de ambos fármacos; potencial impacto tóxico en tejidos embrionarios.' : 'No aplicable (sin embarazo).',
        warning: 'Control periódico de presión arterial, enzimas hepáticas (GOT, GPT) y creatinina sérica.',
      };
    case 'fr':
      return {
        title,
        mechanism: `Interaction pharmacodynamique et élimination hépatique (enzymes CYP) de ${d1.name} et ${d2.name}.`,
        maternalRisk: `Charge métabolique accrue sur le foie, la muqueuse gastrique et la filtration rénale à ${weightKg} kg.`,
        fetalRisk: isPregnant ? 'Passage placentaire des deux molécules ; risque toxique sur les tissus fœtaux.' : 'Non applicable (patiente non enceinte).',
        warning: 'Contrôle régulier de la tension artérielle, des transaminases (ASAT, ALAT) et de la créatinine sérique.',
      };
    case 'it':
      return {
        title,
        mechanism: `Interazione farmacodinamica ed eliminazione epatica (enzimi CYP) di ${d1.name} e ${d2.name}.`,
        maternalRisk: `Carico metabolico additivo su fegato, mucosa gastrica e filtrazione renale a ${weightKg} kg di peso.`,
        fetalRisk: isPregnant ? 'Passaggio transplacentare di entrambi i farmaci; potenziale effetto dannoso sui tessuti fetali.' : 'Non applicabile (assenza di gravidanza).',
        warning: 'Controllo periodico di pressione arteriosa, transaminasi (AST, ALT) e creatinina sierica.',
      };
    case 'ru':
      return {
        title,
        mechanism: `Фармакодинамическое взаимодействие и печеночный клиренс (ферменты CYP) для ${d1.name} и ${d2.name}.`,
        maternalRisk: `Аддитивная нагрузка на печень, слизистую желудка и почечную фильтрацию при весе ${weightKg} кг.`,
        fetalRisk: isPregnant ? 'Трансплацентарный переход обоих препаратов; потенциальное токсическое влияние на ткани плода.' : 'Не применимо (пациент не беременна).',
        warning: 'Регулярный контроль артериального давления, ферментов печени (АСТ, АЛТ) и креатинина сыворотки.',
      };
    case 'de':
    default:
      return {
        title,
        mechanism: `Pharmakodynamische Interaktion und hepatische Elimination (CYP-Enzyme) von ${d1.name} und ${d2.name}.`,
        maternalRisk: `Potenzierte Belastung von Leber, Magenmucosa und Nierenfiltration bei ${weightKg} kg Körpergewicht.`,
        fetalRisk: isPregnant ? 'Plazentagängigkeit beider Arzneistoffe; potenzierte Schadwirkung auf embryonale Gewebe.' : 'Nicht zutreffend (keine Schwangerschaft vorliegend).',
        warning: 'Regelmäßige Kontrolle von Blutdruck, Leberenzymen (GOT, GPT) und Serum-Kreatinin.',
      };
  }
}


