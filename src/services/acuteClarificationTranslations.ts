import { LanguageCode } from '../types';

export interface QuestionMetaI18n {
  category: Record<LanguageCode, string>;
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
}

export interface OptionI18n {
  label: Record<LanguageCode, string>;
  relevanceKeywords?: Record<LanguageCode, string[]>;
}

export const QUESTION_META_BY_DOMAIN: Record<
  string,
  {
    onset: QuestionMetaI18n;
    modality: QuestionMetaI18n;
    sensationMind: QuestionMetaI18n;
    intensity: QuestionMetaI18n;
  }
> = {
  pain_laterality: {
    onset: {
      category: {
        de: 'Schmerzqualität & Empfindung',
        en: 'Pain Character & Sensation',
        es: 'Carácter del dolor y sensación',
        fr: 'Caractère de la douleur et sensation',
        it: 'Carattere del dolore e sensazione',
        el: 'Χαρακτήρας Πόνου & Αίσθηση',
        ru: 'Характер боли и ощущение'
      },
      title: {
        de: '1. Welcher Schmerzcharakter beschreibt die Beschwerde am besten?',
        en: '1. Which pain character best describes the complaint?',
        es: '1. ¿Qué carácter describe mejor el dolor?',
        fr: '1. Quel caractère décrit le mieux la douleur ?',
        it: '1. Quale carattere descrive meglio il dolore?',
        el: '1. Ποιος χαρακτήρας πόνου περιγράφει καλύτερα το σύμπτωμα;',
        ru: '1. Какой характер боли лучше всего описывает жалобу?'
      },
      description: {
        de: 'Die genaue Empfindung ist das führende Symptom zur Auswahl des Akutmittels.',
        en: 'The exact pain sensation is the primary keynote for acute remedy selection.',
        es: 'La sensación exacta es el síntoma guía para seleccionar el remedio agudo.',
        fr: 'La sensation exacte est le symptôme guide pour choisir le remède aigu.',
        it: 'La sensazione esatta è il sintomo guida per la scelta del rimedio acuto.',
        el: 'Η ακριβής αίσθηση του πόνου αποτελεί το καθοδηγητικό σύμπτωμα για την επιλογή του οξέος φαρμάκου.',
        ru: 'Точное ощущение боли является ключевым симптомом для подбора острого препарата.'
      }
    },
    modality: {
      category: {
        de: 'Seitigkeit & Ausstrahlung',
        en: 'Laterality & Radiation',
        es: 'Lateralidad y radiación',
        fr: 'Latéralité et irradiation',
        it: 'Lateralità e irradiazione',
        el: 'Πλευρικότητα & Αντανάκλαση',
        ru: 'Сторона тела и иррадиация'
      },
      title: {
        de: '2. Auf welcher Körperseite liegt der Schmerz bzw. wie strahlt er aus?',
        en: '2. On which side is the pain located or radiating?',
        es: '2. ¿De qué lado se localiza el dolor y cómo se irradia?',
        fr: '2. De quel côté siège la douleur et comment irradie-t-elle ?',
        it: '2. Da quale lato si trova il dolore e come si irradia?',
        el: '2. Σε ποια πλευρά εντοπίζεται ο πόνος ή πώς ακτινοβολεί;',
        ru: '2. На какой стороне тела локализуется боль и куда она иррадиирует?'
      },
      description: {
        de: 'Die Seitigkeit (Links vs. Rechts) ist ein zentrales Kriterium der homöopathischen Differenzierung.',
        en: 'Laterality (left vs right) is a cornerstone of homeopathic differentiation.',
        es: 'La lateralidad (izquierda vs derecha) es un criterio central en la diferenciación homeopática.',
        fr: 'La latéralité (gauche vs droite) est un critère essentiel de différenciation homéopathique.',
        it: 'La lateralità (sinistra vs destra) è un criterio fondamentale della differenziazione omeopatica.',
        el: 'Η πλευρικότητα (αριστερά έναντι δεξιά) αποτελεί θεμελιώδες κριτήριο της ομοιοπαθητικής διαφοροδιάγνωσης.',
        ru: 'Сторона (левая или правая) является важнейшим критерием гомеопатической дифференциации.'
      }
    },
    sensationMind: {
      category: {
        de: 'Gemütszustand & Schmerzreaktion',
        en: 'Emotional State & Pain Reaction',
        es: 'Estado anímico y reacción al dolor',
        fr: 'État d’esprit et réaction à la douleur',
        it: 'Stato d’animo e reazione al dolore',
        el: 'Ψυχική Διάθεση & Αντίδραση στον Πόνο',
        ru: 'Психическое состояние и реакция на боль'
      },
      title: {
        de: '3. Wie ist der Gemütszustand und die seelische Reaktion auf den Schmerz?',
        en: '3. What is the emotional state and mental reaction to the pain?',
        es: '3. ¿Cómo es el estado de ánimo y la reacción emocional al dolor?',
        fr: '3. Quel est l’état d’esprit et la réaction émotionnelle à la douleur ?',
        it: '3. Com’è lo stato d’animo e la reazione emotiva al dolore?',
        el: '3. Ποια είναι η ψυχική διάθεση και η συναισθηματική αντίδραση στον πόνο;',
        ru: '3. Каково эмоциональное состояние и душевная реакция на боль?'
      },
      description: {
        de: 'Die Gemütssymptome im Akutzustand sind nach Hahnemann der entscheidende Wegweiser zum Simile.',
        en: 'According to Hahnemann, acute mental and emotional symptoms are the crucial guide to the similimum.',
        es: 'Según Hahnemann, los síntomas anímicos en el cuadro agudo son la guía decisiva hacia el simillimum.',
        fr: 'Selon Hahnemann, les symptômes de l’esprit dans l’état aigu sont le guide décisif vers le simillimum.',
        it: 'Secondo Hahnemann, i sintomi mentali ed emotivi nello stato acuto sono la guida decisiva verso il simillimum.',
        el: 'Σύμφωνα με τον Hahnemann, τα ψυχικά συμπτώματα στην οξεία κατάσταση είναι ο καθοριστικός οδηγός για το όμοιο.',
        ru: 'По Ганеману, психические и эмоциональные симптомы в остром состоянии служат решающим ориентиром к симилиуму.'
      }
    },
    intensity: {
      category: {
        de: 'Intensitätsgrad (1 bis 4)',
        en: 'Intensity Grade (1 to 4)',
        es: 'Grado de intensidad (1 a 4)',
        fr: 'Degré d’intensité (1 à 4)',
        it: 'Grado di intensità (1 a 4)',
        el: 'Βαθμός Έντασης (1 έως 4)',
        ru: 'Степень интенсивности (от 1 до 4)'
      },
      title: {
        de: '4. Wie stark ist der Akutschmerz ausgeprägt?',
        en: '4. How intense is the acute pain?',
        es: '4. ¿Con qué intensidad se manifiesta el dolor agudo?',
        fr: '4. Quelle est l’intensité de la douleur aiguë ?',
        it: '4. Quanto è intenso il dolore acuto?',
        el: '4. Πόσο έντονος είναι ο οξύς πόνος;',
        ru: '4. Насколько выражена острая боль?'
      },
      description: {
        de: 'Homöopathische Gradeinstufung von 1 bis 4 nach Samuel Hahnemann (keine 1–10 Skala).',
        en: 'Classical homeopathic symptom grade 1 to 4 according to Samuel Hahnemann (not a 1–10 scale).',
        es: 'Graduación homeopática de 1 a 4 según Samuel Hahnemann (no es escala 1–10).',
        fr: 'Graduation homéopathique de 1 à 4 selon Samuel Hahnemann (pas d’échelle 1–10).',
        it: 'Graduazione omeopatica da 1 a 4 secondo Samuel Hahnemann (non scala 1–10).',
        el: 'Ομοιοπαθητική βαθμονόμηση από το 1 έως το 4 κατά Samuel Hahnemann (όχι κλίμακα 1–10).',
        ru: 'Гомеопатическая градация выраженности от 1 до 4 по Самуэлю Ганеману (не шкала 1–10).'
      }
    }
  },
  gastrointestinal: {
    onset: {
      category: {
        de: 'Art der Magen-Darm-Beschwerden',
        en: 'Gastrointestinal Character',
        es: 'Tipo de molestias gastrointestinales',
        fr: 'Nature des troubles digestifs',
        it: 'Tipo di disturbi gastrointestinali',
        el: 'Τύπος Γαστρεντερικών Ενοχλήσεων',
        ru: 'Характер желудочно-кишечных жалоб'
      },
      title: {
        de: '1. Welche Symptome stehen im Vordergrund?',
        en: '1. Which symptoms are most prominent?',
        es: '1. ¿Qué síntomas predominan?',
        fr: '1. Quels symptômes sont au premier plan ?',
        it: '1. Quali sintomi sono in primo piano?',
        el: '1. Ποια συμπτώματα βρίσκονται στο προσκήνιο;',
        ru: '1. Какие симптомы находятся на первом плане?'
      },
      description: {
        de: 'Charakteristische Zeichen der Verdauungsorgane grenzen die Leitmittel ein.',
        en: 'Key features of digestive organs narrow down leading remedies.',
        es: 'Las características de los órganos digestivos delimitan los remedios clave.',
        fr: 'Les signes digestifs caractéristiques ciblent les remèdes majeurs.',
        it: 'I segni caratteristici degli organi digestivi delimitano i rimedi guida.',
        el: 'Τα χαρακτηριστικά σημεία των πεπτικών οργάνων περιορίζουν τα κύρια φάρμακα.',
        ru: 'Характерные признаки органов пищеварения сужают выбор ведущих препаратов.'
      }
    },
    modality: {
      category: {
        de: 'Möglicher Auslöser',
        en: 'Possible Trigger',
        es: 'Posible desencadenante',
        fr: 'Facteur déclenchant possible',
        it: 'Possibile fattore scatenante',
        el: 'Πιθανός Εκλυτικός Παράγοντας',
        ru: 'Возможная причина / триггер'
      },
      title: {
        de: '2. Was ging den Beschwerden voraus bzw. war der Auslöser?',
        en: '2. What preceded the complaints or triggered them?',
        es: '2. ¿Qué precedió a los síntomas o fue el desencadenante?',
        fr: '2. Qu’est-ce qui a précédé les troubles ou les a déclenchés ?',
        it: '2. Che cosa ha preceduto i disturbi o ne è stato la causa?',
        el: '2. Τι προηγήθηκε των ενοχλήσεων ή ποιος ήταν ο εκλυτικός παράγοντας;',
        ru: '2. Что предшествовало жалобам или послужило пусковым фактором?'
      },
      description: {
        de: 'Die Causa ist ein zentraler Wegweiser im Magen-Darm-Bereich.',
        en: 'The cause (causa) is a key guide in gastrointestinal disorders.',
        es: 'La causa es una guía fundamental en problemas digestivos.',
        fr: 'La cause est un repère central dans les troubles digestifs.',
        it: 'La causa è un elemento guida cruciale nei disturbi digestivi.',
        el: 'Το αίτιο (causa) είναι κεντρικός οδηγός στις γαστρεντερικές διαταραχές.',
        ru: 'Причина (causa) является ключевым ориентиром при расстройствах ЖКТ.'
      }
    },
    sensationMind: {
      category: {
        de: 'Gemütszustand & emotionale Verfassung',
        en: 'Emotional State & Mental Disposition',
        es: 'Estado anímico y disposición mental',
        fr: 'État d’esprit et disposition mentale',
        it: 'Stato d’animo e disposizione mentale',
        el: 'Ψυχική Διάθεση & Συναισθηματική Κατάσταση',
        ru: 'Психическое состояние и душевный настрой'
      },
      title: {
        de: '3. Wie ist der Gemütszustand bei den Magen-Darm-Beschwerden?',
        en: '3. What is the emotional and mental state during the GI distress?',
        es: '3. ¿Cómo es el estado de ánimo durante el malestar digestivo?',
        fr: '3. Quel est l’état d’esprit lors des troubles digestifs ?',
        it: '3. Com’è lo stato d’animo durante i disturbi gastrointestinali?',
        el: '3. Ποια είναι η ψυχική διάθεση κατά τις γαστρεντερικές ενοχλήσεις;',
        ru: '3. Каково душевное состояние при желудочно-кишечных расстройствах?'
      },
      description: {
        de: 'Große Unruhe mit Angst, Reizbarkeit oder Wehleidigkeit weisen direkt auf das Mittel.',
        en: 'Great restlessness with anxiety, irritability, or tearfulness directly point to the remedy.',
        es: 'Gran inquietud con ansiedad, irritabilidad o llanto orientan directamente al remedio.',
        fr: 'Grande agitation avec anxiété, irritabilité ou pleurnicherie orientent vers le remède.',
        it: 'Grande irrequietezza con ansia, irritabilità o pianto guidano direttamente al rimedio.',
        el: 'Μεγάλη ανησυχία με άγχος, εκνευρισμός ή κλάμα δείχνουν άμεσα το φάρμακο.',
        ru: 'Сильное беспокойство с тревогой, раздражительность или плаксивость прямо указывают на препарат.'
      }
    },
    intensity: {
      category: {
        de: 'Intensitätsgrad (1 bis 4)',
        en: 'Intensity Grade (1 to 4)',
        es: 'Grado de intensidad (1 a 4)',
        fr: 'Degré d’intensité (1 à 4)',
        it: 'Grado di intensità (1 a 4)',
        el: 'Βαθμός Έντασης (1 έως 4)',
        ru: 'Степень интенсивности (от 1 до 4)'
      },
      title: {
        de: '4. Wie stark beeinträchtigen die Magen-Darm-Beschwerden?',
        en: '4. How severely do the gastrointestinal complaints affect you?',
        es: '4. ¿Cuánto afectan las molestias gastrointestinales?',
        fr: '4. À quel point les troubles gastro-intestinaux vous affectent-ils ?',
        it: '4. Quanto interferiscono i disturbi gastrointestinali?',
        el: '4. Πόσο έντονα σας επηρεάζουν τα γαστρεντερικά ενοχλήματα;',
        ru: '4. Насколько сильно беспокоят симптомы со стороны ЖКТ?'
      },
      description: {
        de: 'Homöopathische Gradeinstufung von 1 bis 4 nach Samuel Hahnemann.',
        en: 'Classical homeopathic grading from 1 to 4 according to Samuel Hahnemann.',
        es: 'Graduación homeopática de 1 a 4 según Samuel Hahnemann.',
        fr: 'Graduation homéopathique de 1 à 4 selon Samuel Hahnemann.',
        it: 'Graduazione omeopatica da 1 a 4 secondo Samuel Hahnemann.',
        el: 'Ομοιοπαθητική βαθμονόμηση από το 1 έως το 4 κατά Hahnemann.',
        ru: 'Гомеопатическая градация выраженности от 1 до 4 по Самуэлю Ганеману.'
      }
    }
  },
  respiratory: {
    onset: {
      category: {
        de: 'Husten- & Halscharakter',
        en: 'Cough & Throat Character',
        es: 'Carácter de la tos y garganta',
        fr: 'Caractère de la toux et de la gorge',
        it: 'Carattere della tosse e gola',
        el: 'Χαρακτήρας Βήχα & Λαιμού',
        ru: 'Характер кашля и горла'
      },
      title: {
        de: '1. Wie äußert sich der Husten bzw. die Halsbeschwerde?',
        en: '1. How does the cough or throat complaint present?',
        es: '1. ¿Cómo se manifiesta la tos o el dolor de garganta?',
        fr: '1. Comment se manifeste la toux ou le mal de gorge ?',
        it: '1. Come si manifesta la tosse o il mal di gola?',
        el: '1. Πώς εκδηλώνεται ο βήχας ή η ενόχληση στο λαιμό;',
        ru: '1. Как проявляется кашель или боль в горле?'
      },
      description: {
        de: 'Akustik des Hustens und Empfindung im Hals führen zur Arznei.',
        en: 'Sound of the cough and throat sensations guide to the remedy.',
        es: 'El sonido de la tos y la sensación en la garganta orientan hacia el remedio.',
        fr: 'Le son de la toux et les sensations de gorge guident vers le remède.',
        it: 'Il suono della tosse e le sensazioni alla gola orientano verso il rimedio.',
        el: 'Ο ήχος του βήχα και η αίσθηση στο λαιμό οδηγούν στο κατάλληλο φάρμακο.',
        ru: 'Звук кашля и ощущения в горле указывают на точный препарат.'
      }
    },
    modality: {
      category: {
        de: 'Luft- & Raummodalität',
        en: 'Air & Room Modality',
        es: 'Modalidad de aire y ambiente',
        fr: 'Modalité d’air et de pièce',
        it: 'Modalità aria e ambiente',
        el: 'Αέρας & Περιβάλλον',
        ru: 'Влияние воздуха и помещения'
      },
      title: {
        de: '2. Wie reagiert die Atmung auf Raum- und Umgebungsluft?',
        en: '2. How does respiration react to room and ambient air?',
        es: '2. ¿Cómo reacciona la respiración al aire ambiente y a la temperatura?',
        fr: '2. Comment la respiration réagit-elle à l’air ambiant ?',
        it: '2. Come reagisce la respirazione all’aria della stanza e all’ambiente?',
        el: '2. Πώς αντιδρά η αναπνοή στον αέρα του δωματίου και στο περιβάλλον;',
        ru: '2. Как реагирует дыхание на воздух в комнате и на улице?'
      },
      description: {
        de: 'Temperatur und Frischluft sind Schlüsselfaktoren bei Atemwegsinfekten.',
        en: 'Temperature and fresh air are key differentiating factors in respiratory illnesses.',
        es: 'La temperatura y el aire fresco son factores clave en infecciones respiratorias.',
        fr: 'La température et l’air frais sont des facteurs déterminants.',
        it: 'La temperatura e l’aria fresca sono fattori chiave nelle affezioni respiratorie.',
        el: 'Η θερμοκρασία και ο φρέσκος αέρας είναι κρίσιμοι παράγοντες στις λοιμώξεις αναπνευστικού.',
        ru: 'Температура и свежий воздух — главные дифференцирующие факторы при инфекциях дыхательных путей.'
      }
    },
    sensationMind: {
      category: {
        de: 'Gemütszustand & seelische Verfassung',
        en: 'Emotional State & Mental Disposition',
        es: 'Estado anímico y disposición mental',
        fr: 'État d’esprit et disposition mentale',
        it: 'Stato d’animo e disposizione mentale',
        el: 'Ψυχική Διάθεση & Συναισθηματική Κατάσταση',
        ru: 'Психическое состояние и душевный настрой'
      },
      title: {
        de: '3. Wie ist der Gemütszustand während des Hustens oder Infekts?',
        en: '3. What is the emotional state during the cough or infection?',
        es: '3. ¿Cómo es el estado de ánimo durante la tos o la infección?',
        fr: '3. Quel est l’état d’esprit pendant la toux ou l’infection ?',
        it: '3. Com’è lo stato d’animo durante la tosse o l’infezione?',
        el: '3. Ποια είναι η ψυχική διάθεση κατά τον βήχα ή τη λοίμωξη;',
        ru: '3. Каково душевное состояние во время кашля или инфекции?'
      },
      description: {
        de: 'Ängstlichkeit, Atemnot-Panik, Reizbarkeit oder Weinen leiten das Atemwegsmittel.',
        en: 'Anxiety, panic with breathlessness, irritability, or weeping guide the respiratory remedy.',
        es: 'Ansiedad, pánico con disnea, irritabilidad o llanto guían el remedio respiratorio.',
        fr: 'Anxiété, panique avec essoufflement, irritabilité ou pleurs guident le remède.',
        it: 'Ansia, panico con dispnea, irritabilità o pianto guidano il rimedio respiratorio.',
        el: 'Άγχος, πανικός δύσπνοιας, ευερεθιστότητα ή κλάμα καθοδηγούν το αναπνευστικό φάρμακο.',
        ru: 'Тревога, паника при одышке, раздражительность или плач направляют выбор средства.'
      }
    },
    intensity: {
      category: {
        de: 'Intensitätsgrad (1 bis 4)',
        en: 'Intensity Grade (1 to 4)',
        es: 'Grado de intensidad (1 a 4)',
        fr: 'Degré d’intensité (1 à 4)',
        it: 'Grado di intensità (1 a 4)',
        el: 'Βαθμός Έντασης (1 έως 4)',
        ru: 'Степень интенсивности (от 1 до 4)'
      },
      title: {
        de: '4. Wie stark ist der Hustenreiz bzw. Halsschmerz?',
        en: '4. How intense is the cough or sore throat?',
        es: '4. ¿Qué tan intensa es la tos o el dolor de garganta?',
        fr: '4. Quelle est l’intensité de la toux ou du mal de gorge ?',
        it: '4. Quanto è intensa la tosse o il mal di gola?',
        el: '4. Πόσο έντονος είναι ο βήχας ή ο πονόλαιμος;',
        ru: '4. Насколько силен кашель или боль в горле?'
      },
      description: {
        de: 'Klassische homöopathische Einstufung von 1 bis 4 nach Samuel Hahnemann.',
        en: 'Classical homeopathic grading from 1 to 4 according to Samuel Hahnemann.',
        es: 'Graduación homeopática clásica de 1 a 4 según Samuel Hahnemann.',
        fr: 'Graduation homéopathique classique de 1 à 4 selon Samuel Hahnemann.',
        it: 'Graduazione omeopatica classica da 1 a 4 secondo Samuel Hahnemann.',
        el: 'Κλασική ομοιοπαθητική βαθμονόμηση από το 1 έως το 4 κατά Hahnemann.',
        ru: 'Классическая гомеопатическая градация от 1 до 4 по Самуэлю Ганеману.'
      }
    }
  },
  headache: {
    onset: {
      category: {
        de: 'Schmerztyp des Kopfschmerzes',
        en: 'Headache Character & Type',
        es: 'Tipo de dolor de cabeza',
        fr: 'Type de mal de tête',
        it: 'Tipo di cefalea',
        el: 'Τύπος Πονοκεφάλου',
        ru: 'Тип головной боли'
      },
      title: {
        de: '1. Wie fühlt sich der Kopfschmerz genau an?',
        en: '1. How exactly does the headache feel?',
        es: '1. ¿Cómo se siente exactamente el dolor de cabeza?',
        fr: '1. Comment le mal de tête est-il ressenti exactement ?',
        it: '1. Come si manifesta esattamente la cefalea?',
        el: '1. Πώς ακριβώς γίνεται αισθητός ο πονοκέφαλος;',
        ru: '1. Как именно ощущается головная боль?'
      },
      description: {
        de: 'Die Schmerzqualität im Kopf ist eines der sichersten Leitsymptome.',
        en: 'The pain quality in the head is one of the most reliable guiding symptoms.',
        es: 'La calidad del dolor de cabeza es uno de los síntomas guía más fiables.',
        fr: 'La qualité de la douleur céphalique est l’un des symptômes les plus fiables.',
        it: 'La qualità del dolore alla testa è uno dei sintomi guida più affidabili.',
        el: 'Η ποιότητα του πόνου στο κεφάλι είναι ένα από τα ασφαλέστερα καθοδηγητικά συμπτώματα.',
        ru: 'Характер головной боли — один из самых надежных ключевых симптомов.'
      }
    },
    modality: {
      category: {
        de: 'Einfluss von Bewegung & Reizen',
        en: 'Influence of Motion & Stimuli',
        es: 'Influencia del movimiento y estímulos',
        fr: 'Influence du mouvement et des stimuli',
        it: 'Influenza di movimento e stimoli',
        el: 'Επίδραση Κίνησης & Ερεθισμάτων',
        ru: 'Влияние движения и раздражителей'
      },
      title: {
        de: '2. Was verschlimmert den Kopfschmerz am stärksten?',
        en: '2. What aggravates the headache most severely?',
        es: '2. ¿Qué empeora el dolor de cabeza de forma más notable?',
        fr: '2. Qu’est-ce qui aggrave le plus le mal de tête ?',
        it: '2. Che cosa aggrava maggiormente la cefalea?',
        el: '2. Τι επιδεινώνει εντονότερα τον πονοκέφαλο;',
        ru: '2. Что сильнее всего ухудшает головную боль?'
      },
      description: {
        de: 'Erschütterungs- und Reizempfindlichkeit trennen Belladonna, Bryonia und Co.',
        en: 'Sensitivity to jarring and light differentiates Belladonna from Bryonia.',
        es: 'La sensibilidad a las sacudidas y a la luz distingue Belladonna de Bryonia.',
        fr: 'La sensibilité aux secousses et à la lumière distingue Belladonna de Bryonia.',
        it: 'La sensibilità alle scosse e alla luce differenzia Belladonna da Bryonia.',
        el: 'Η ευαισθησία σε κραδασμούς και ερεθίσματα διαχωρίζει τη Belladonna από τη Bryonia.',
        ru: 'Чувствительность к сотрясению и свету отличает Belladonna от Bryonia.'
      }
    },
    sensationMind: {
      category: {
        de: 'Gemütszustand & Verhalten',
        en: 'Emotional State & Behavior',
        es: 'Estado anímico y comportamiento',
        fr: 'État d’esprit et comportement',
        it: 'Stato d’animo e comportamento',
        el: 'Ψυχική Διάθεση & Συμπεριφορά',
        ru: 'Психическое состояние и поведение'
      },
      title: {
        de: '3. Wie ist der Gemütszustand während des Kopfschmerzes?',
        en: '3. What is the emotional disposition during the headache?',
        es: '3. ¿Cómo es el estado de ánimo durante el dolor de cabeza?',
        fr: '3. Quel est l’état d’esprit pendant le mal de tête ?',
        it: '3. Com’è lo stato d’animo durante la cefalea?',
        el: '3. Ποια είναι η ψυχική διάθεση κατά τη διάρκεια του πονοκεφάλου;',
        ru: '3. Каково душевное состояние во время головной боли?'
      },
      description: {
        de: 'Gereiztheit, Angst, Jammern oder Verlangen nach Ruhe entscheiden das Kopfschmerzmittel.',
        en: 'Irritability, anxiety, tearfulness, or need for quiet define the headache remedy.',
        es: 'La irritabilidad, la ansiedad, el llanto o la necesidad de calma definen el remedio.',
        fr: 'L’irritabilité, l’anxiété, les pleurs ou le besoin de calme déterminent le remède.',
        it: 'L’irritabilità, l’ansia, il pianto o il bisogno di calma definiscono il rimedio.',
        el: 'Ο εκνευρισμός, το άγχος, το κλάμα ή η ανάγκη για ησυχία καθορίζουν το φάρμακο.',
        ru: 'Раздражительность, тревога, плаксивость или потребность в покое определяют выбор препарата.'
      }
    },
    intensity: {
      category: {
        de: 'Intensitätsgrad (1 bis 4)',
        en: 'Intensity Grade (1 to 4)',
        es: 'Grado de intensidad (1 a 4)',
        fr: 'Degré d’intensité (1 à 4)',
        it: 'Grado di intensità (1 a 4)',
        el: 'Βαθμός Έντασης (1 έως 4)',
        ru: 'Степень интенсивности (от 1 до 4)'
      },
      title: {
        de: '4. Wie stark ist der Kopfschmerz ausgeprägt?',
        en: '4. How intense is the headache?',
        es: '4. ¿Cuál es la intensidad del dolor de cabeza?',
        fr: '4. Quelle est l’intensité du mal de tête ?',
        it: '4. Quanto è intensa la cefalea?',
        el: '4. Πόσο έντονος είναι ο πονοκέφαλος;',
        ru: '4. Насколько сильна головная боль?'
      },
      description: {
        de: 'Klassische Einstufung von 1 bis 4 nach Samuel Hahnemann.',
        en: 'Classical homeopathic grade 1 to 4 according to Samuel Hahnemann.',
        es: 'Graduación clásica de 1 a 4 según Samuel Hahnemann.',
        fr: 'Graduation classique de 1 à 4 selon Samuel Hahnemann.',
        it: 'Graduazione classica da 1 a 4 secondo Samuel Hahnemann.',
        el: 'Κλασική βαθμονόμηση από το 1 έως το 4 κατά Samuel Hahnemann.',
        ru: 'Классическая градация от 1 до 4 по Самуэлю Ганеману.'
      }
    }
  },
  injury: {
    onset: {
      category: {
        de: 'Art der Verletzung (Trauma)',
        en: 'Type of Injury (Trauma)',
        es: 'Tipo de lesión (traumatismo)',
        fr: 'Type de lésion (traumatisme)',
        it: 'Tipo di lesione (trauma)',
        el: 'Είδος Τραυματισμού (Τραύμα)',
        ru: 'Вид травмы (травматизм)'
      },
      title: {
        de: '1. Welche Verletzungsform liegt vor?',
        en: '1. Which type of injury has occurred?',
        es: '1. ¿Qué tipo de lesión se ha producido?',
        fr: '1. Quelle forme de lésion est présente ?',
        it: '1. Quale tipo di lesione si è verificata?',
        el: '1. Ποια μορφή τραυματισμού έχει συμβεί;',
        ru: '1. Какая форма травмы имеет место?'
      },
      description: {
        de: 'Gewebetyp und Traumamechanismus bestimmen das homöopathische Wundmittel.',
        en: 'Tissue type and injury mechanism determine the homeopathic trauma remedy.',
        es: 'El tipo de tejido y el mecanismo traumático determinan el remedio homeopático.',
        fr: 'Le type de tissu et le mécanisme du traumatisme déterminent le remède.',
        it: 'Il tipo di tessuto e il meccanismo del trauma determinano il rimedio.',
        el: 'Ο τύπος ιστού και ο μηχανισμός του τραύματος καθορίζουν το ομοιοπαθητικό επουλωτικό φάρμακο.',
        ru: 'Тип поврежденной ткани и механизм травмы определяют заживляющий препарат.'
      }
    },
    modality: {
      category: {
        de: 'Bewegungsmodalität',
        en: 'Motion Modality',
        es: 'Modalidad de movimiento',
        fr: 'Modalité de mouvement',
        it: 'Modalità di movimento',
        el: 'Τροποποίηση με την Κίνηση',
        ru: 'Модальность движения'
      },
      title: {
        de: '2. Wie verhält sich der Schmerz bei Bewegung der verletzten Stelle?',
        en: '2. How does the pain behave on moving the injured area?',
        es: '2. ¿Cómo se comporta el dolor al mover la zona lesionada?',
        fr: '2. Comment la douleur évolue-t-elle lors du mouvement de la zone blessée ?',
        it: '2. Come si comporta il dolore muovendo la parte lesionata?',
        el: '2. Πώς συμπεριφέρεται ο πόνος κατά την κίνηση του τραυματισμένου σημείου;',
        ru: '2. Как ведет себя боль при движении поврежденной части?'
      },
      description: {
        de: 'Das Anlauf- und Ruheverhalten grenzt Rhus tox von Bryonia ab.',
        en: 'Behaviour at onset of motion vs rest distinguishes Rhus tox from Bryonia.',
        es: 'El comportamiento al inicio del movimiento vs reposo distingue Rhus tox de Bryonia.',
        fr: 'Le comportement au début du mouvement vs repos distingue Rhus tox de Bryonia.',
        it: 'Il comportamento all’inizio del movimento rispetto al riposo distingue Rhus tox da Bryonia.',
        el: 'Η αντίδραση στην έναρξη της κίνησης και στην ηρεμία διαχωρίζει το Rhus tox από τη Bryonia.',
        ru: 'Реакция в начале движения и в покое отличает Rhus tox от Bryonia.'
      }
    },
    sensationMind: {
      category: {
        de: 'Gemütszustand & Traumareaktion',
        en: 'Mental State & Trauma Reaction',
        es: 'Estado anímico y reacción al trauma',
        fr: 'État d’esprit et réaction au traumatisme',
        it: 'Stato d’animo e reazione al trauma',
        el: 'Ψυχική Διάθεση & Αντίδραση στο Τραύμα',
        ru: 'Психическое состояние и реакция на травму'
      },
      title: {
        de: '3. Wie ist der Gemütszustand nach der Verletzung?',
        en: '3. What is the emotional and mental state following the injury?',
        es: '3. ¿Cómo es el estado de ánimo tras la lesión?',
        fr: '3. Quel est l’état d’esprit après la blessure ?',
        it: '3. Com’è lo stato d’animo dopo la lesione?',
        el: '3. Ποια είναι η ψυχική διάθεση μετά τον τραυματισμό;',
        ru: '3. Каково душевное состояние после травмы?'
      },
      description: {
        de: 'Verleugnung des Schmerzes („Mir fehlt nichts!“), Zorn oder Schockangst kennzeichnen das Wundmittel.',
        en: 'Denial of pain (“I’m fine!”), anger, or shock anxiety distinguish the injury remedy.',
        es: 'Negación del dolor (“¡No me pasa nada!”), ira o miedo por shock distinguen el remedio.',
        fr: 'Déni de la douleur (« Tout va bien ! »), colère ou anxiété de choc caractérisent le remède.',
        it: 'Negazione del dolore (« Non ho nulla! »), rabbia o ansia da shock caratterizzano il rimedio.',
        el: 'Η άρνηση του πόνου («Δεν έχω τίποτα!»), ο θυμός ή το άγχος του σοκ καθορίζουν το φάρμακο.',
        ru: 'Отрицание боли («Я в порядке!»), гнев или шоковая тревога точно определяют препарат при травме.'
      }
    },
    intensity: {
      category: {
        de: 'Intensitätsgrad (1 bis 4)',
        en: 'Intensity Grade (1 to 4)',
        es: 'Grado de intensidad (1 a 4)',
        fr: 'Degré d’intensité (1 à 4)',
        it: 'Grado di intensità (1 a 4)',
        el: 'Βαθμός Έντασης (1 έως 4)',
        ru: 'Степень интенсивности (от 1 до 4)'
      },
      title: {
        de: '4. Wie stark ist die Schmerzintensität der Verletzung?',
        en: '4. How intense is the pain of the injury?',
        es: '4. ¿Cuál es la intensidad del dolor de la lesión?',
        fr: '4. Quelle est l’intensité de la douleur de la blessure ?',
        it: '4. Quanto è intenso il dolore della lesione?',
        el: '4. Πόσο έντονος είναι ο πόνος του τραυματισμού;',
        ru: '4. Насколько выражена боль от травмы?'
      },
      description: {
        de: 'Hahnemannsche Einstufung von 1 bis 4.',
        en: 'Hahnemannian grading from 1 to 4.',
        es: 'Graduación de Hahnemann de 1 a 4.',
        fr: 'Graduation hahnemannienne de 1 à 4.',
        it: 'Graduazione hahnemanniana da 1 a 4.',
        el: 'Βαθμονόμηση κατά Hahnemann από το 1 έως το 4.',
        ru: 'Градация по Ганеману от 1 до 4.'
      }
    }
  },
  fever: {
    onset: {
      category: {
        de: 'Fieberverlauf & Beginn',
        en: 'Fever Course & Onset',
        es: 'Curso de la fiebre e inicio',
        fr: 'Évolution de la fièvre et début',
        it: 'Decorso della febbre e inizio',
        el: 'Πορεία Πυρετού & Έναρξη',
        ru: 'Течение лихорадки и начало'
      },
      title: {
        de: '1. Wie hat das Fieber begonnen und wie verläuft es?',
        en: '1. How did the fever begin and how does it develop?',
        es: '1. ¿Cómo comenzó la fiebre y cómo evoluciona?',
        fr: '1. Comment la fièvre a-t-elle commencé et comment évolue-t-elle ?',
        it: '1. Come è iniziata la febbre e come evolve?',
        el: '1. Πώς ξεκίνησε ο πυρετός και πώς εξελίσσεται;',
        ru: '1. Как началась лихорадка и как она развивается?'
      },
      description: {
        de: 'Temperaturkurve und Hautzustand entscheiden im Fieberstadium.',
        en: 'Temperature curve and skin state determine the fever stage.',
        es: 'La curva térmica y el estado de la piel deciden el estadio febril.',
        fr: 'La courbe de température et l’état de la peau déterminent le stade.',
        it: 'La curva febbrile e lo stato della pelle determinano lo stadio febbrile.',
        el: 'Η καμπύλη θερμοκρασίας και η κατάσταση του δέρματος καθορίζουν το στάδιο του πυρετού.',
        ru: 'Температурная кривая и состояние кожи определяют стадию лихорадки.'
      }
    },
    modality: {
      category: {
        de: 'Durst & Trinkverhalten',
        en: 'Thirst & Drinking Pattern',
        es: 'Sed y consumo de líquidos',
        fr: 'Soif et hydratation',
        it: 'Sete e assunzione di liquidi',
        el: 'Δίψα & Πρόσληψη Υγρών',
        ru: 'Жажда и питьевой режим'
      },
      title: {
        de: '2. Wie ist das Durstverhalten während des Fiebers?',
        en: '2. What is the thirst behaviour during the fever?',
        es: '2. ¿Cómo es la sed durante la fiebre?',
        fr: '2. Quel est le comportement de la soif pendant la fièvre ?',
        it: '2. Com’è la sete durante la febbre?',
        el: '2. Πώς είναι η δίψα κατά τη διάρκεια του πυρετού;',
        ru: '2. Каков характер жажды во время лихорадки?'
      },
      description: {
        de: 'Durstlosigkeit oder Gier nach Eiswasser sind hochgradige Differenzierer.',
        en: 'Thirstlessness or craving for ice-cold water are key differentiators.',
        es: 'La ausencia de sed o el ansia de agua helada son grandes diferenciadores.',
        fr: 'L’absence de soif ou le désir d’eau glacée sont de grands discriminateurs.',
        it: 'L’assenza di sete o il bisogno di acqua ghiacciata sono elementi differenziali chiave.',
        el: 'Η απουσία δίψας ή η επιθυμία για παγωμένο νερό είναι ισχυροί δείκτες διαφοροποίησης.',
        ru: 'Отсутствие жажды или тяга к ледяной воде — главные дифференциальные признаки.'
      }
    },
    sensationMind: {
      category: {
        de: 'Gemüt & Schweiß',
        en: 'Mental State & Perspiration',
        es: 'Estado anímico y sudoración',
        fr: 'État d’esprit et transpiration',
        it: 'Stato d’animo e sudorazione',
        el: 'Ψυχική Διάθεση & Εφίδρωση',
        ru: 'Психическое состояние и пот'
      },
      title: {
        de: '3. Wie ist die Gemütsverfassung und Schweißbildung?',
        en: '3. What is the mental disposition and sweating pattern?',
        es: '3. ¿Cómo es el estado de ánimo y el patrón de sudor?',
        fr: '3. Quel est l’état d’esprit et la transpiration ?',
        it: '3. Com’è lo stato d’animo e la sudorazione?',
        el: '3. Πώς είναι η διάθεση και η παραγωγή ιδρώτα;',
        ru: '3. Каково душевное состояние и характер потоотделения?'
      },
      description: {
        de: 'Verhalten im Fieberwahn oder Zustand des Nervensystems.',
        en: 'Behaviour in febrile delirium or state of the nervous system.',
        es: 'Comportamiento en el delirio febril o estado del sistema nervioso.',
        fr: 'Comportement dans le délire fébrile ou état du système nerveux.',
        it: 'Comportamento nel delirio febbrile o stato del sistema nervoso.',
        el: 'Η συμπεριφορά στο παραλήρημα ή η κατάσταση του νευρικού συστήματος.',
        ru: 'Поведение при лихорадочном бреде или состояние нервной системы.'
      }
    },
    intensity: {
      category: {
        de: 'Intensitätsgrad (1 bis 4)',
        en: 'Intensity Grade (1 to 4)',
        es: 'Grado de intensidad (1 a 4)',
        fr: 'Degré d’intensité (1 à 4)',
        it: 'Grado di intensità (1 a 4)',
        el: 'Βαθμός Έντασης (1 έως 4)',
        ru: 'Степень интенсивности (от 1 до 4)'
      },
      title: {
        de: '4. Wie hoch bzw. beeinträchtigend ist der Fieberzustand?',
        en: '4. How high or debilitating is the fever state?',
        es: '4. ¿Cómo de alta o debilitante es la fiebre?',
        fr: '4. À quel point l’état fébrile est-il élevé ou handicapant ?',
        it: '4. Quanto è elevato o debilitante lo stato febbrile?',
        el: '4. Πόσο έντονη είναι η κατάσταση του πυρετού;',
        ru: '4. Насколько выражено или тяжело состояние лихорадки?'
      },
      description: {
        de: 'Hahnemannsche Einstufung von 1 bis 4.',
        en: 'Hahnemannian grading from 1 to 4.',
        es: 'Graduación de Hahnemann de 1 a 4.',
        fr: 'Graduation hahnemannienne de 1 à 4.',
        it: 'Graduazione hahnemanniana da 1 a 4.',
        el: 'Βαθμονόμηση κατά Hahnemann από το 1 έως το 4.',
        ru: 'Градация по Ганеману от 1 до 4.'
      }
    }
  },
  skin: {
    onset: {
      category: {
        de: 'Hauterscheinung & Schwellung',
        en: 'Skin Eruption & Swelling',
        es: 'Erupción cutánea e hinchazón',
        fr: 'Éruption cutanée et gonflement',
        it: 'Eruzione cutanea e gonfiore',
        el: 'Δερματική Εκδήλωση & Οίδημα',
        ru: 'Кожные высыпания и отек'
      },
      title: {
        de: '1. Wie sieht die betroffene Hautstelle aus?',
        en: '1. How does the affected skin area look?',
        es: '1. ¿Qué aspecto tiene la zona de la piel afectada?',
        fr: '1. À quoi ressemble la zone cutanée affectée ?',
        it: '1. Che aspetto ha la zona della pelle colpita?',
        el: '1. Πώς φαίνεται η προσβεβλημένη περιοχή του δέρματος;',
        ru: '1. Как выглядит пораженный участок кожи?'
      },
      description: {
        de: 'Morphologie und Entzündungszeichen der Haut führen zum Simile.',
        en: 'Morphology and inflammatory signs of the skin lead to the similimum.',
        es: 'La morfología y los signos inflamatorios conducen al simillimum.',
        fr: 'La morphologie et les signes inflammatoires mènent au simillimum.',
        it: 'La morfologia e i segni infiammatori portano al simillimum.',
        el: 'Η μορφολογία και τα σημεία φλεγμονής του δέρματος οδηγούν στο κατάλληλο όμοιο.',
        ru: 'Морфология и признаки воспаления кожи ведут к точному препарату.'
      }
    },
    modality: {
      category: {
        de: 'Lokale Temperaturmodalität',
        en: 'Local Temperature Modality',
        es: 'Modalidad térmica local',
        fr: 'Modalité thermique locale',
        it: 'Modalità termica locale',
        el: 'Τοπική Θερμοκρασιακή Αντίδραση',
        ru: 'Местная температурная модальность'
      },
      title: {
        de: '2. Was bringt der Hautstelle spürbare Linderung?',
        en: '2. What brings noticeable relief to the skin?',
        es: '2. ¿Qué proporciona un alivio apreciable a la piel?',
        fr: '2. Qu’est-ce qui apporte un soulagement sensible à la peau ?',
        it: '2. Che cosa porta un sollievo sensibile alla pelle?',
        el: '2. Τι προσφέρει αισθητή ανακούφιση στο δέρμα;',
        ru: '2. Что приносит заметное облегчение пораженной коже?'
      },
      description: {
        de: 'Die Reaktion auf Kälte vs. Hitze ist der Hauptschlüssel bei Hautsymptomen.',
        en: 'Response to cold vs heat is the primary key in dermatological symptoms.',
        es: 'La respuesta al frío frente al calor es la clave principal en la piel.',
        fr: 'La réponse au froid par rapport au chaud est la clé principale.',
        it: 'La risposta al freddo rispetto al caldo è la chiave principale.',
        el: 'Η αντίδραση στο κρύο έναντι της ζέστης είναι το κλειδί στα δερματικά συμπτώματα.',
        ru: 'Реакция на холод или тепло — главный ключ при кожных симптомах.'
      }
    },
    sensationMind: {
      category: {
        de: 'Schmerzgefühl & Gemüt',
        en: 'Sensation & Mental State',
        es: 'Sensación de dolor y estado anímico',
        fr: 'Sensation de douleur et état d’esprit',
        it: 'Sensazione di dolore e stato d’animo',
        el: 'Αίσθημα Πόνου & Ψυχική Κατάσταση',
        ru: 'Ощущение боли и душевное состояние'
      },
      title: {
        de: '3. Welche Empfindung quält am meisten?',
        en: '3. Which sensation causes the most distress?',
        es: '3. ¿Qué sensación atormenta más?',
        fr: '3. Quelle sensation est la plus pénible ?',
        it: '3. Quale sensazione tormenta di più?',
        el: '3. Ποια αίσθηση σας ταλαιπωρεί περισσότερο;',
        ru: '3. Какое ощущение мучает больше всего?'
      },
      description: {
        de: 'Gemütszustand und Schmerztyp vervollständigen das Hautbild.',
        en: 'Mental state and pain quality complete the skin picture.',
        es: 'El estado anímico y el tipo de dolor completan el cuadro cutáneo.',
        fr: 'L’état d’esprit et le type de douleur complètent le tableau cutané.',
        it: 'Lo stato d’animo e il tipo di dolore completano il quadro cutaneo.',
        el: 'Η ψυχική διάθεση και ο τύπος του πόνου ολοκληρώνουν τη δερματική εικόνα.',
        ru: 'Душевное состояние и тип боли дополняют картину кожных проявлений.'
      }
    },
    intensity: {
      category: {
        de: 'Intensitätsgrad (1 bis 4)',
        en: 'Intensity Grade (1 to 4)',
        es: 'Grado de intensidad (1 a 4)',
        fr: 'Degré d’intensité (1 à 4)',
        it: 'Grado di intensità (1 a 4)',
        el: 'Βαθμός Έντασης (1 έως 4)',
        ru: 'Степень интенсивности (от 1 до 4)'
      },
      title: {
        de: '4. Wie stark ist das Hautsymptom ausgeprägt?',
        en: '4. How intense is the skin symptom?',
        es: '4. ¿Con qué intensidad se manifiesta el síntoma en la piel?',
        fr: '4. Quelle est l’intensité du symptôme cutané ?',
        it: '4. Quanto è marcato il sintomo cutaneo?',
        el: '4. Πόσο έντονο είναι το δερματικό σύμπτωμα;',
        ru: '4. Насколько выражен симптом со стороны кожи?'
      },
      description: {
        de: 'Hahnemannsche Einstufung von 1 bis 4.',
        en: 'Hahnemannian grading from 1 to 4.',
        es: 'Graduación de Hahnemann de 1 a 4.',
        fr: 'Graduation hahnemannienne de 1 à 4.',
        it: 'Graduazione hahnemanniana da 1 a 4.',
        el: 'Βαθμονόμηση κατά Hahnemann από το 1 έως το 4.',
        ru: 'Градация по Ганеману от 1 до 4.'
      }
    }
  },
  general: {
    onset: {
      category: {
        de: 'Auslöser & Beginn (Causa)',
        en: 'Trigger & Onset (Causa)',
        es: 'Desencadenante e inicio (Causa)',
        fr: 'Déclencheur et début (Causa)',
        it: 'Fattore scatenante e inizio (Causa)',
        el: 'Εκλυτικός Παράγοντας & Έναρξη (Causa)',
        ru: 'Причина и начало (Causa)'
      },
      title: {
        de: '1. Wie haben die Beschwerden begonnen und was war der Auslöser?',
        en: '1. How did the symptoms begin and what was the trigger?',
        es: '1. ¿Cómo comenzaron los síntomas y cuál fue el desencadenante?',
        fr: '1. Comment les troubles ont-ils commencé et quel a été le déclencheur ?',
        it: '1. Come sono iniziati i disturbi e qual è stato il fattore scatenante?',
        el: '1. Πώς ξεκίνησαν τα συμπτώματα και ποιος ήταν ο εκλυτικός παράγοντας;',
        ru: '1. Как начались симптомы и что послужило пусковым фактором?'
      },
      description: {
        de: 'Der Auslöser ist eines der wichtigsten Differenzierungskriterien in der Homöopathie.',
        en: 'The onset and trigger are paramount for classical homeopathic remedy differentiation.',
        es: 'El desencadenante es uno de los criterios de diferenciación más importantes en homeopatía.',
        fr: 'Le déclencheur est l’un des critères de différenciation les plus importants en homéopathie.',
        it: 'Il fattore scatenante è uno dei criteri di differenziazione più importanti in omeopatia.',
        el: 'Ο εκλυτικός παράγοντας είναι ένα από τα σημαντικότερα κριτήρια διαφοροποίησης στην ομοιοπαθητική.',
        ru: 'Пусковой фактор — один из важнейших дифференциальных критериев в гомеопатии.'
      }
    },
    modality: {
      category: {
        de: 'Modalitäten (Besser / Schlechter)',
        en: 'Modalities (Better / Worse)',
        es: 'Modalidades (Mejor / Peor)',
        fr: 'Modalités (Mieux / Pire)',
        it: 'Modalità (Migliora / Peggiora)',
        el: 'Τροποποιητικοί Παράγοντες (Καλύτερα / Χειρότερα)',
        ru: 'Модальности (Лучше / Хуже)'
      },
      title: {
        de: '2. Was bringt Linderung oder führt zur Verschlechterung?',
        en: '2. What brings relief or aggravates the complaint?',
        es: '2. ¿Qué alivia o agrava las molestias?',
        fr: '2. Qu’est-ce qui apporte un soulagement ou aggrave les troubles ?',
        it: '2. Che cosa porta sollievo o peggiora il disturbo?',
        el: '2. Τι φέρνει ανακούφιση ή επιδεινώνει τα συμπτώματα;',
        ru: '2. Что приносит облегчение или вызывает ухудшение?'
      },
      description: {
        de: 'Modalitäten sind entscheidend, um zwischen eng verwandten Akutmitteln zu unterscheiden.',
        en: 'Modalities are decisive for distinguishing between closely related acute remedies.',
        es: 'Las modalidades son decisivas para distinguir entre remedios agudos estrechamente relacionados.',
        fr: 'Les modalités sont décisives pour distinguer des remèdes proches.',
        it: 'Le modalità sono decisive per distinguere tra rimedi acuti strettamente correlati.',
        el: 'Οι τροποποιητικοί παράγοντες είναι καθοριστικοί για τη διάκριση μεταξύ συγγενών φαρμάκων.',
        ru: 'Модальности имеют решающее значение для различения близких острых препаратов.'
      }
    },
    sensationMind: {
      category: {
        de: 'Gemüt & Hauptempfindung',
        en: 'Emotional State & Core Sensation',
        es: 'Estado anímico y sensación principal',
        fr: 'État d’esprit et sensation principale',
        it: 'Stato d’animo e sensazione principale',
        el: 'Ψυχική Διάθεση & Κύρια Αίσθηση',
        ru: 'Психическое состояние и главное ощущение'
      },
      title: {
        de: '3. Wie ist die Gemütsstimmung und die Schmerzqualität?',
        en: '3. What is the emotional disposition and sensation?',
        es: '3. ¿Cómo es el estado de ánimo y la calidad del dolor?',
        fr: '3. Quel est l’état d’esprit et la qualité de la douleur ?',
        it: '3. Com’è lo stato d’animo e la qualità del dolore?',
        el: '3. Ποια είναι η ψυχική διάθεση και η ποιότητα του πόνου;',
        ru: '3. Каково настроение и характер боли?'
      },
      description: {
        de: 'Das Verhalten und Gemüt im Akutzustand zeigt das charakteristische Mittelbild.',
        en: 'The acute mental disposition reveals the characteristic remedy picture.',
        es: 'El comportamiento y el estado mental en el cuadro agudo muestran el remedio característico.',
        fr: 'Le comportement et l’état mental dans l’état aigu révèlent le tableau du remède.',
        it: 'Il comportamento e lo stato mentale nello stato acuto rivelano il quadro del rimedio.',
        el: 'Η συμπεριφορά και η ψυχική κατάσταση στην οξεία φάση αποκαλύπτουν το χαρακτηριστικό φάρμακο.',
        ru: 'Поведение и душевное состояние в остром периоде указывают на характерный препарат.'
      }
    },
    intensity: {
      category: {
        de: 'Intensitätsgrad (1 bis 4)',
        en: 'Intensity Grade (1 to 4)',
        es: 'Grado de intensidad (1 a 4)',
        fr: 'Degré d’intensité (1 à 4)',
        it: 'Grado di intensità (1 a 4)',
        el: 'Βαθμός Έντασης (1 έως 4)',
        ru: 'Степень интенсивности (от 1 до 4)'
      },
      title: {
        de: '4. Wie stark ist das Leitsymptom ausgeprägt?',
        en: '4. How intense is the leading symptom?',
        es: '4. ¿Con qué intensidad se manifiesta el síntoma guía?',
        fr: '4. Quelle est l’intensité du symptôme guide ?',
        it: '4. Quanto è marcato il sintomo guida?',
        el: '4. Πόσο έντονο είναι το κύριο σύμπτωμα;',
        ru: '4. Насколько сильно выражен ведущий симптом?'
      },
      description: {
        de: 'Homöopathische Gradeinstufung von 1 bis 4 nach Samuel Hahnemann (keine 1–10 Skala).',
        en: 'Classical homeopathic symptom grade 1 to 4 (strictly not a 1–10 scale).',
        es: 'Graduación homeopática de 1 a 4 según Samuel Hahnemann (no es escala 1–10).',
        fr: 'Graduation homéopathique de 1 à 4 selon Samuel Hahnemann (pas d’échelle 1–10).',
        it: 'Graduazione omeopatica da 1 a 4 secondo Samuel Hahnemann (non scala 1–10).',
        el: 'Ομοιοπαθητική βαθμονόμηση από το 1 έως το 4 κατά Samuel Hahnemann (όχι κλίμακα 1–10).',
        ru: 'Гомеопатическая градация выраженности от 1 до 4 по Самуэлю Ганеману (не 1–10).'
      }
    }
  }
};
