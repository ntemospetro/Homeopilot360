const fs = require('fs');

const newKeys = {
  landingSubtitle: {
    de: 'Künstliche Intelligenz für die klassische Homöopathie',
    en: 'Artificial Intelligence for Classical Homeopathy',
    fr: 'Intelligence Artificielle pour l\'Homéopathie Classique',
    el: 'Τεχνητή Νοημοσύνη για την Κλασική Ομοιοπαθητική',
    it: 'Intelligenza Artificiale per l\'Omeopatia Classica',
    ru: 'Искусственный интеллект для классической гомеопатии',
    es: 'Inteligencia Artificial para la Homeopatía Clásica'
  },
  landingTitle1: {
    de: 'Präzise Repertorisation & ',
    en: 'Precise Repertorization & ',
    fr: 'Répertorisation précise & ',
    el: 'Ακριβής Λήψη Ιστορικού & ',
    it: 'Repertorizzazione precisa & ',
    ru: 'Точная реперторизация и ',
    es: 'Repertorización precisa & '
  },
  landingTitle2: {
    de: 'intelligente Anamnese',
    en: 'intelligent Anamnesis',
    fr: 'Anamnèse intelligente',
    el: 'Έξυπνο Ιστορικό',
    it: 'Anamnesi intelligente',
    ru: 'интеллектуальный анамнез',
    es: 'Anamnesis inteligente'
  },
  landingDescription: {
    de: 'Revolutionieren Sie Ihre Praxis mit dem fortschrittlichsten digitalen Assistenten. Geführtes Patienteninterview, tiefgreifende Symptom-Analyse nach Hahnemann (Organon) und präzise Mittelwahl in Sekunden.',
    en: 'Revolutionize your practice with the most advanced digital assistant. Guided patient interview, in-depth symptom analysis according to Hahnemann (Organon) and precise remedy selection in seconds.',
    fr: 'Révolutionnez votre cabinet avec l\'assistant numérique le plus avancé. Entretien guidé du patient, analyse approfondie des symptômes selon Hahnemann (Organon) et sélection précise du remède en quelques secondes.',
    el: 'Επαναστατήστε το ιατρείο σας με τον πιο προηγμένο ψηφιακό βοηθό. Καθοδηγούμενη συνέντευξη ασθενούς, σε βάθος ανάλυση συμπτωμάτων κατά Χάνεμαν (Όργανον) και ακριβής επιλογή ομοιοπαθητικού φαρμάκου σε δευτερόλεπτα.',
    it: 'Rivoluziona il tuo studio con l\'assistente digitale più avanzato. Intervista guidata del paziente, analisi approfondita dei sintomi secondo Hahnemann (Organon) e selezione precisa del rimedio in pochi secondi.',
    ru: 'Революционизируйте свою практику с самым передовым цифровым помощником. Управляемое интервью с пациентом, глубокий анализ симптомов по Ганеману (Органон) и точный выбор препарата за секунды.',
    es: 'Revolucione su práctica con el asistente digital más avanzado. Entrevista guiada al paciente, análisis profundo de los síntomas según Hahnemann (Organon) y selección precisa del remedio en segundos.'
  },
  landingBtnTest: {
    de: 'Jetzt kostenlos testen',
    en: 'Try for free now',
    fr: 'Essayer gratuitement',
    el: 'Δοκιμάστε δωρεάν',
    it: 'Prova gratis ora',
    ru: 'Попробовать бесплатно',
    es: 'Probar gratis ahora'
  },
  landingBtnLogin: {
    de: 'Zum Login',
    en: 'Login',
    fr: 'Connexion',
    el: 'Σύνδεση',
    it: 'Accedi',
    ru: 'Войти',
    es: 'Iniciar sesión'
  },
  landingBadgeGdpr: {
    de: 'DSGVO Konform',
    en: 'GDPR Compliant',
    fr: 'Conforme RGPD',
    el: 'Συμβατό με GDPR',
    it: 'Conforme GDPR',
    ru: 'Соответствует GDPR',
    es: 'Cumple con RGPD'
  },
  landingBadgeNoCard: {
    de: 'Keine Kreditkarte nötig',
    en: 'No credit card required',
    fr: 'Pas de carte de crédit requise',
    el: 'Δεν απαιτείται πιστωτική κάρτα',
    it: 'Nessuna carta di credito richiesta',
    ru: 'Кредитная карта не требуется',
    es: 'No se requiere tarjeta de crédito'
  },
  landingFeaturesTitle: {
    de: 'Entwickelt für den Praxisalltag',
    en: 'Developed for everyday practice',
    fr: 'Développé pour la pratique quotidienne',
    el: 'Αναπτύχθηκε για την καθημερινή πρακτική',
    it: 'Sviluppato per la pratica quotidiana',
    ru: 'Разработано для повседневной практики',
    es: 'Desarrollado para la práctica diaria'
  },
  landingFeaturesDesc: {
    de: 'Unsere Plattform kombiniert das klassische Wissen der Materia Medica mit modernster KI-Technologie, um Sie bei der optimalen Mittelwahl zu unterstützen.',
    en: 'Our platform combines the classical knowledge of the Materia Medica with state-of-the-art AI technology to support you in optimal remedy selection.',
    fr: 'Notre plateforme combine les connaissances classiques de la Materia Medica avec la technologie d\'IA de pointe pour vous aider à choisir le remède optimal.',
    el: 'Η πλατφόρμα μας συνδυάζει την κλασική γνώση της Materia Medica με τεχνολογία AI αιχμής για να σας υποστηρίξει στη βέλτιστη επιλογή φαρμάκου.',
    it: 'La nostra piattaforma combina la conoscenza classica della Materia Medica con la più avanzata tecnologia IA per supportarti nella selezione ottimale del rimedio.',
    ru: 'Наша платформа объединяет классические знания Материи Медики с передовыми технологиями ИИ для поддержки в оптимальном выборе препарата.',
    es: 'Nuestra plataforma combina el conocimiento clásico de la Materia Médica con tecnología de IA de vanguardia para apoyarlo en la selección óptima del remedio.'
  },
  landingFeature1Title: {
    de: 'Intelligente Anamnese',
    en: 'Intelligent Anamnesis',
    fr: 'Anamnèse Intelligente',
    el: 'Έξυπνο Ιστορικό',
    it: 'Anamnesi Intelligente',
    ru: 'Интеллектуальный анамнез',
    es: 'Anamnesis Inteligente'
  },
  landingFeature1Desc: {
    de: 'Dynamische, sich anpassende Fragen basierend auf der Hauptbeschwerde. Erkennt selbstständig, ob es sich um physische Leiden oder psychische Belastungen (Organon §210-230) handelt.',
    en: 'Dynamic, adaptive questions based on the chief complaint. Automatically recognizes whether it involves physical ailments or psychological burdens (Organon §210-230).',
    fr: 'Questions dynamiques et adaptatives basées sur la plainte principale. Reconnaît automatiquement s\'il s\'agit d\'affections physiques ou de charges psychologiques (Organon §210-230).',
    el: 'Δυναμικές, προσαρμοστικές ερωτήσεις βάσει του κύριου παραπόνου. Αναγνωρίζει αυτόματα αν πρόκειται για σωματικές παθήσεις ή ψυχολογικά βάρη (Όργανον §210-230).',
    it: 'Domande dinamiche e adattive basate sul sintomo principale. Riconosce automaticamente se si tratta di disturbi fisici o carichi psicologici (Organon §210-230).',
    ru: 'Динамические, адаптивные вопросы на основе главной жалобы. Автоматически распознает, идет ли речь о физических недугах или психологических нагрузках (Органон §210-230).',
    es: 'Preguntas dinámicas y adaptativas basadas en la queja principal. Reconoce automáticamente si se trata de dolencias físicas o cargas psicológicas (Organon §210-230).'
  },
  landingFeature2Title: {
    de: 'Präzise Repertorisation',
    en: 'Precise Repertorization',
    fr: 'Répertorisation précise',
    el: 'Ακριβής ρεπερτοριοποίηση',
    it: 'Repertorizzazione precisa',
    ru: 'Точная реперторизация',
    es: 'Repertorización precisa'
  },
  landingFeature2Desc: {
    de: 'Der Algorithmus verknüpft Symptome, Gemüt, Modalitäten und Auslöser, um zielgenaue Mittel-Vorschläge inklusive Begründung und Potenzen zu generieren.',
    en: 'The algorithm links symptoms, mind, modalities, and triggers to generate precise remedy suggestions including justification and potencies.',
    fr: 'L\'algorithme relie les symptômes, l\'esprit, les modalités et les déclencheurs pour générer des suggestions de remèdes précises incluant la justification et les dilutions.',
    el: 'Ο αλγόριθμος συνδέει συμπτώματα, νου, τροπικότητες και εκλυτικούς παράγοντες για να παράγει ακριβείς προτάσεις φαρμάκων συμπεριλαμβανομένης της αιτιολόγησης και των δυναμοποιήσεων.',
    it: 'L\'algoritmo collega sintomi, mente, modalità e fattori scatenanti per generare suggerimenti precisi di rimedi, incluse giustificazioni e potenze.',
    ru: 'Алгоритм связывает симптомы, психику, модальности и триггеры для генерации точных предложений препаратов, включая обоснование и потенции.',
    es: 'El algoritmo vincula síntomas, mente, modalidades y desencadenantes para generar sugerencias precisas de remedios, incluyendo justificación y potencias.'
  },
  landingFeature3Title: {
    de: 'Digitale Patientenakte',
    en: 'Digital Patient Record',
    fr: 'Dossier Patient Numérique',
    el: 'Ψηφιακός Φάκελος Ασθενούς',
    it: 'Fascicolo Sanitario Digitale',
    ru: 'Цифровая медкарта',
    es: 'Expediente de Paciente Digital'
  },
  landingFeature3Desc: {
    de: 'Verwalten Sie Fälle, Behandlungsverläufe und verordnete Mittel übersichtlich an einem Ort. Mit automatischer Zusammenfassung der Spontanberichte.',
    en: 'Manage cases, treatment progress, and prescribed remedies clearly in one place. With automatic summarization of spontaneous reports.',
    fr: 'Gérez clairement les cas, l\'évolution des traitements et les remèdes prescrits au même endroit. Avec un résumé automatique des rapports spontanés.',
    el: 'Διαχειριστείτε περιστατικά, πορείες θεραπείας και συνταγογραφούμενα φάρμακα καθαρά σε ένα μέρος. Με αυτόματη σύνοψη των αυθόρμητων αναφορών.',
    it: 'Gestisci casi, andamento dei trattamenti e rimedi prescritti in modo chiaro in un unico posto. Con sintesi automatica delle segnalazioni spontanee.',
    ru: 'Управляйте случаями, ходом лечения и назначенными препаратами в одном месте. С автоматическим резюмированием спонтанных отчетов.',
    es: 'Gestione casos, el progreso de tratamientos y remedios recetados claramente en un solo lugar. Con resumen automático de informes espontáneos.'
  },
  landingFeature4Title: {
    de: 'Mehrsprachigkeit',
    en: 'Multilingual Support',
    fr: 'Support Multilingue',
    el: 'Πολυγλωσσική Υποστήριξη',
    it: 'Supporto Multilingue',
    ru: 'Многоязычная поддержка',
    es: 'Soporte Multilingüe'
  },
  landingFeature4Desc: {
    de: 'Die Oberfläche sowie die Patientenfragen sind in 7 Sprachen verfügbar (u.a. Deutsch, Englisch, Spanisch, Russisch). Ideal für internationale Praxen.',
    en: 'The interface and patient questions are available in 7 languages (incl. English, German, Spanish, Russian). Ideal for international practices.',
    fr: 'L\'interface et les questions aux patients sont disponibles en 7 langues (dont le français, l\'anglais, l\'espagnol). Idéal pour les cabinets internationaux.',
    el: 'Η διεπαφή και οι ερωτήσεις ασθενών είναι διαθέσιμες σε 7 γλώσσες (συμπ. Αγγλικά, Ελληνικά). Ιδανικό για διεθνή ιατρεία.',
    it: 'L\'interfaccia e le domande per i pazienti sono disponibili in 7 lingue (incluso italiano, inglese, spagnolo). Ideale per studi internazionali.',
    ru: 'Интерфейс и вопросы пациентам доступны на 7 языках (в т.ч. русский, английский, немецкий). Идеально для международных практик.',
    es: 'La interfaz y las preguntas para los pacientes están disponibles en 7 idiomas (incl. español, inglés, alemán). Ideal para consultorios internacionales.'
  },
  landingFeature5Title: {
    de: 'Höchste Datensicherheit',
    en: 'Highest Data Security',
    fr: 'Sécurité Maximale des Données',
    el: 'Ύψιστη Ασφάλεια Δεδομένων',
    it: 'Massima Sicurezza dei Dati',
    ru: 'Высочайшая безопасность данных',
    es: 'Máxima Seguridad de Datos'
  },
  landingFeature5Desc: {
    de: 'Alle Patientendaten werden strikt nach DSGVO-Richtlinien verarbeitet. Modernste Verschlüsselung sorgt für den Schutz sensibler Gesundheitsdaten.',
    en: 'All patient data is strictly processed according to GDPR guidelines. State-of-the-art encryption ensures the protection of sensitive health data.',
    fr: 'Toutes les données des patients sont strictement traitées selon les directives RGPD. Un chiffrement de pointe assure la protection des données de santé sensibles.',
    el: 'Όλα τα δεδομένα των ασθενών επεξεργάζονται αυστηρά σύμφωνα με τις οδηγίες του GDPR. Η κρυπτογράφηση αιχμής εξασφαλίζει την προστασία ευαίσθητων δεδομένων υγείας.',
    it: 'Tutti i dati dei pazienti sono trattati rigorosamente secondo le direttive GDPR. La crittografia all\'avanguardia garantisce la protezione dei dati sanitari sensibili.',
    ru: 'Все данные пациентов обрабатываются в строгом соответствии с директивами GDPR. Современное шифрование обеспечивает защиту конфиденциальных медицинских данных.',
    es: 'Todos los datos de los pacientes se procesan estrictamente de acuerdo con las pautas del RGPD. La encriptación de última generación garantiza la protección de datos de salud sensibles.'
  },
  landingFeature6Title: {
    de: 'Sichere Cloud-Speicherung',
    en: 'Secure Cloud Storage',
    fr: 'Stockage Cloud Sécurisé',
    el: 'Ασφαλής Αποθήκευση Cloud',
    it: 'Archiviazione Cloud Sicura',
    ru: 'Безопасное облачное хранение',
    es: 'Almacenamiento Seguro en la Nube'
  },
  landingFeature6Desc: {
    de: 'Greifen Sie von überall auf Ihre Fälle zu. Egal ob am Praxis-PC, auf dem Tablet oder Smartphone – Ihre Daten sind sicher und geräteübergreifend synchronisiert.',
    en: 'Access your cases from anywhere. Whether on the practice PC, tablet or smartphone – your data is secure and synchronized across devices.',
    fr: 'Accédez à vos cas de n\'importe où. Que ce soit sur le PC du cabinet, sur tablette ou smartphone - vos données sont sécurisées et synchronisées entre les appareils.',
    el: 'Αποκτήστε πρόσβαση στα περιστατικά σας από οπουδήποτε. Είτε στον υπολογιστή του ιατρείου, στο tablet ή στο smartphone - τα δεδομένα σας είναι ασφαλή και συγχρονισμένα σε όλες τις συσκευές.',
    it: 'Accedi ai tuoi casi da ovunque. Sul PC dello studio, su tablet o smartphone: i tuoi dati sono al sicuro e sincronizzati tra i dispositivi.',
    ru: 'Получите доступ к своим случаям откуда угодно. Будь то ПК в клинике, планшет или смартфон — ваши данные в безопасности и синхронизируются на всех устройствах.',
    es: 'Acceda a sus casos desde cualquier lugar. Ya sea en la PC del consultorio, en la tableta o en el teléfono inteligente: sus datos están seguros y sincronizados en todos los dispositivos.'
  },
  landingStepsTitle: {
    de: 'In 3 Schritten zum passenden Mittel',
    en: 'In 3 steps to the right remedy',
    fr: 'En 3 étapes vers le bon remède',
    el: 'Σε 3 βήματα στο σωστό φάρμακο',
    it: 'In 3 passaggi verso il rimedio giusto',
    ru: '3 шага к подходящему препарату',
    es: 'En 3 pasos hacia el remedio adecuado'
  },
  landingStepsDesc: {
    de: 'Der Behandlungsablauf ist intuitiv gestaltet, um Ihnen so viel Arbeit wie möglich abzunehmen.',
    en: 'The treatment process is intuitively designed to take as much work off your hands as possible.',
    fr: 'Le processus de traitement est conçu de manière intuitive pour vous soulager au maximum.',
    el: 'Η διαδικασία θεραπείας είναι σχεδιασμένη διαισθητικά για να σας απαλλάξει από όσο το δυνατόν περισσότερη δουλειά.',
    it: 'Il processo di trattamento è progettato in modo intuitivo per toglierti più lavoro possibile.',
    ru: 'Процесс лечения интуитивно понятен, чтобы снять с вас как можно больше работы.',
    es: 'El proceso de tratamiento está diseñado intuitivamente para quitarle la mayor cantidad de trabajo posible.'
  },
  landingStep1Title: {
    de: 'Symptome erfassen',
    en: 'Record Symptoms',
    fr: 'Enregistrer les Symptômes',
    el: 'Καταγραφή Συμπτωμάτων',
    it: 'Registrare i Sintomi',
    ru: 'Запись симптомов',
    es: 'Registrar Síntomas'
  },
  landingStep1Desc: {
    de: 'Geben Sie die Hauptbeschwerde in eigenen Worten ein. Die KI analysiert den Text sofort.',
    en: 'Enter the chief complaint in your own words. The AI analyzes the text immediately.',
    fr: 'Saisissez la plainte principale avec vos propres mots. L\'IA analyse le texte immédiatement.',
    el: 'Εισάγετε το κύριο παράπονο με δικά σας λόγια. Η τεχνητή νοημοσύνη αναλύει το κείμενο άμεσα.',
    it: 'Inserisci il disturbo principale con le tue parole. L\'IA analizza il testo immediatamente.',
    ru: 'Введите главную жалобу своими словами. ИИ немедленно проанализирует текст.',
    es: 'Ingrese la queja principal con sus propias palabras. La IA analiza el texto de inmediato.'
  },
  landingStep2Title: {
    de: 'Gezielte Rückfragen',
    en: 'Targeted Follow-up Questions',
    fr: 'Questions Ciblées de Suivi',
    el: 'Στοχευμένες Ερωτήσεις Follow-up',
    it: 'Domande Mirate di Follow-up',
    ru: 'Целенаправленные вопросы',
    es: 'Preguntas de Seguimiento Dirigidas'
  },
  landingStep2Desc: {
    de: 'Das System generiert dynamische, auf den Patienten zugeschnittene Fragen zu Modalitäten und Gemüt.',
    en: 'The system generates dynamic, patient-tailored questions on modalities and mind.',
    fr: 'Le système génère des questions dynamiques, adaptées au patient, sur les modalités et l\'esprit.',
    el: 'Το σύστημα παράγει δυναμικές, προσαρμοσμένες στον ασθενή ερωτήσεις για τροπικότητες και ψυχική κατάσταση.',
    it: 'Il sistema genera domande dinamiche su misura per il paziente riguardo a modalità e mente.',
    ru: 'Система генерирует динамические вопросы для пациента о модальностях и психике.',
    es: 'El sistema genera preguntas dinámicas adaptadas al paciente sobre modalidades y estado mental.'
  },
  landingStep3Title: {
    de: 'Analyse & Vorschlag',
    en: 'Analysis & Suggestion',
    fr: 'Analyse et Suggestion',
    el: 'Ανάλυση & Πρόταση',
    it: 'Analisi e Suggerimento',
    ru: 'Анализ и Предложение',
    es: 'Análisis y Sugerencia'
  },
  landingStep3Desc: {
    de: 'Erhalten Sie eine strukturierte Auswertung mit klaren Mittelvorschlägen und Materia Medica Hinweisen.',
    en: 'Receive a structured evaluation with clear remedy suggestions and Materia Medica references.',
    fr: 'Recevez une évaluation structurée avec des propositions claires de remèdes et des indications Materia Medica.',
    el: 'Λάβετε μια δομημένη αξιολόγηση με σαφείς προτάσεις φαρμάκων και ενδείξεις Materia Medica.',
    it: 'Ricevi una valutazione strutturata con chiare proposte di rimedi e indicazioni Materia Medica.',
    ru: 'Получите структурированную оценку с четкими предложениями препаратов и указаниями Материи Медики.',
    es: 'Reciba una evaluación estructurada con sugerencias claras de remedios e indicaciones de Materia Médica.'
  },
  landingCtaTitle: {
    de: 'Bereit für die Zukunft der Homöopathie?',
    en: 'Ready for the future of homeopathy?',
    fr: 'Prêt pour l\'avenir de l\'homéopathie ?',
    el: 'Έτοιμοι για το μέλλον της ομοιοπαθητικής;',
    it: 'Pronto per il futuro dell\'omeopatia?',
    ru: 'Готовы к будущему гомеопатии?',
    es: '¿Listo para el futuro de la homeopatía?'
  },
  landingCtaDesc: {
    de: 'Melden Sie sich jetzt an und testen Sie die Software kostenlos. Überzeugen Sie sich selbst von der präzisen Unterstützung im Praxisalltag.',
    en: 'Sign up now and test the software for free. See for yourself the precise support in everyday practice.',
    fr: 'Inscrivez-vous maintenant et testez le logiciel gratuitement. Jugez par vous-même du soutien précis dans la pratique quotidienne.',
    el: 'Εγγραφείτε τώρα και δοκιμάστε το λογισμικό δωρεάν. Δείτε μόνοι σας την ακριβή υποστήριξη στην καθημερινή πρακτική.',
    it: 'Iscriviti ora e prova il software gratuitamente. Scopri tu stesso il preciso supporto nella pratica quotidiana.',
    ru: 'Зарегистрируйтесь сейчас и попробуйте программное обеспечение бесплатно. Убедитесь сами в точной поддержке в повседневной практике.',
    es: 'Regístrese ahora y pruebe el software gratis. Compruebe usted mismo el apoyo preciso en la práctica diaria.'
  },
  landingCtaBtn: {
    de: 'Jetzt Account erstellen',
    en: 'Create Account Now',
    fr: 'Créer un Compte',
    el: 'Δημιουργία Λογαριασμού',
    it: 'Crea Account Ora',
    ru: 'Создать аккаунт',
    es: 'Crear Cuenta Ahora'
  }
};

let lines = fs.readFileSync('src/i18n/translations.ts', 'utf8').split('\n');
let out = [];
const langs = ['de', 'en', 'es', 'fr', 'el', 'it', 'ru'];
let currLang = null;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // match language block start
  let m = line.match(/^  ([a-z]{2}): \{/);
  if (m) {
    currLang = m[1];
  }
  
  // if we hit the end of a language block `  },` or `};`
  if (currLang && (line === '  },' || line === '};')) {
    // Append our keys BEFORE this line
    for (const [key, trans] of Object.entries(newKeys)) {
      const text = trans[currLang] || trans['en'];
      out.push(`    ${key}: '${text.replace(/'/g, "\\'")}',`);
    }
    currLang = null;
  }
  
  out.push(line);
}

fs.writeFileSync('src/i18n/translations.ts', out.join('\n'));
