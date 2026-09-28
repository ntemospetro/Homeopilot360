import { LanguageCode } from '../types';

export const CANONICAL_KENT_TERMS: Record<string, Partial<Record<LanguageCode, string>>> = {
  // Core Symptoms
  "Schmerz": { en: "Pain", es: "Dolor", fr: "Douleur", it: "Dolore", el: "Πόνος", ru: "Боль", de: "Schmerz" },
  "Kopfschmerz": { en: "Headache", es: "Dolor de cabeza / Cefalea", fr: "Maux de tête / Céphalée", it: "Mal di testa / Cefalea", el: "Κεφαλαλγία", ru: "Головная боль", de: "Kopfschmerz" },
  "Hautausschläge": { en: "Eruptions", es: "Erupciones", fr: "Éruptions", it: "Eruzioni", el: "Εξανθήματα", ru: "Высыпания", de: "Hautausschläge" },
  "Schwäche": { en: "Weakness", es: "Debilidad", fr: "Faiblesse", it: "Debolezza", el: "Αδυναμία", ru: "Слабость", de: "Schwäche" },
  "Jucken": { en: "Itching", es: "Picazón", fr: "Démangeaisons", it: "Prurito", el: "Κνησμός", ru: "Зуд", de: "Jucken" },
  "Verfärbung": { en: "Discoloration", es: "Decoloración", fr: "Décoloration", it: "Decolorazione", el: "Αποχρωματισμός", ru: "Изменение цвета", de: "Verfärbung" },
  "Kälte": { en: "Coldness", es: "Frío", fr: "Froid", it: "Freddo", el: "Κρυάδα", ru: "Холод", de: "Kälte" },
  "Wahnideen": { en: "Delusions", es: "Delirios", fr: "Délires", it: "Deliri", el: "Παραληρήματα", ru: "Бред", de: "Wahnideen" },
  "Hitze": { en: "Heat", es: "Calor", fr: "Chaleur", it: "Calore", el: "Ζέστη", ru: "Жар", de: "Hitze" },
  "Schwellung": { en: "Swelling", es: "Hinchazón", fr: "Gonflement", it: "Gonfiore", el: "Οίδημα", ru: "Отек", de: "Schwellung" },
  "Zucken": { en: "Twitching", es: "Espasmos", fr: "Secousses", it: "Spasmi", el: "Σπασμοί", ru: "Подергивания", de: "Zucken" },
  "Krämpfe": { en: "Cramps", es: "Calambres", fr: "Crampes", it: "Crampi", el: "Κράμπες", ru: "Судороги", de: "Krämpfe" },
  "Geräusche": { en: "Noises", es: "Ruidos", fr: "Bruits", it: "Rumori", el: "Θόρυβοι", ru: "Шумы", de: "Geräusche" },
  "Taubheitsgefühl": { en: "Numbness", es: "Entumecimiento", fr: "Engourdissement", it: "Intorpidimento", el: "Μούδιασμα", ru: "Онемение", de: "Taubheitsgefühl" },
  "Spannung": { en: "Tension", es: "Tensión", fr: "Tension", it: "Tensione", el: "Τάση", ru: "Напряжение", de: "Spannung" },
  "Schwere": { en: "Heaviness", es: "Pesadez", fr: "Lourdeur", it: "Pesantezza", el: "Βάρος", ru: "Тяжесть", de: "Schwere" },
  "Geschwüre": { en: "Ulcers", es: "Úlceras", fr: "Ulcères", it: "Ulcere", el: "Έλκη", ru: "Язвы", de: "Geschwüre" },
  "Erbrechen": { en: "Vomiting", es: "Vómitos", fr: "Vomissements", it: "Vomito", el: "Έμετος", ru: "Рвота", de: "Erbrechen" },
  "Aufstoßen": { en: "Eructations", es: "Eructos", fr: "Éructations", it: "Eruttazioni", el: "Ερυγές", ru: "Отрыжка", de: "Aufstoßen" },
  "Zittern": { en: "Trembling", es: "Temblor", fr: "Tremblement", it: "Tremore", el: "Τρέμουλο", ru: "Дрожь", de: "Zittern" },
  "Zusammenschnüren": { en: "Constriction", es: "Constricción", fr: "Constriction", it: "Costrizione", el: "Σύσφιξη", ru: "Сжатие", de: "Zusammenschnüren" },
  "Träume": { en: "Dreams", es: "Sueños", fr: "Rêves", it: "Sogni", el: "Όνειρα", ru: "Сны", de: "Träume" },
  "pulsierend": { en: "Pulsating", es: "Pulsátil", fr: "Pulsatile", it: "Pulsante", el: "Παλλόμενος", ru: "Пульсирующий", de: "pulsierend" },
  "Pulsieren": { en: "Pulsation", es: "Pulsación", fr: "Pulsation", it: "Pulsazione", el: "Σφυγμός", ru: "Пульсация", de: "Pulsieren" },
  "Diarrhoe": { en: "Diarrhea", es: "Diarrea", fr: "Diarrhée", it: "Diarrea", el: "Διάρροια", ru: "Диарея", de: "Diarrhoe" },
  "Entzündung": { en: "Inflammation", es: "Inflamación", fr: "Inflammation", it: "Infiammazione", el: "Φλεγμονή", ru: "Воспаление", de: "Entzündung" },
  "Schwitzen": { en: "Sweating", es: "Sudoración", fr: "Transpiration", it: "Sudorazione", el: "Ιδρώτας", ru: "Потоотделение", de: "Schwitzen" },
  "Steifheit": { en: "Stiffness", es: "Rigidez", fr: "Raideur", it: "Rigidità", el: "Δυσκαμψία", ru: "Скованность", de: "Steifheit" },
  "Geschmack": { en: "Taste", es: "Gusto", fr: "Goût", it: "Gusto", el: "Γεύση", ru: "Вкус", de: "Geschmack" },
  "Übelkeit": { en: "Nausea", es: "Náuseas", fr: "Nausée", it: "Nausea", el: "Ναυτία", ru: "Тошнота", de: "Übelkeit" },
  "Furcht": { en: "Fear", es: "Miedo", fr: "Peur", it: "Paura", el: "Φόβος", ru: "Страх", de: "Furcht" },
  "Angst": { en: "Anxiety", es: "Ansiedad", fr: "Anxiété", it: "Ansia", el: "Άγχος", ru: "Тревога", de: "Angst" },
  "Lähmung": { en: "Paralysis", es: "Parálisis", fr: "Paralysie", it: "Paralisi", el: "Παράλυση", ru: "Паралич", de: "Lähmung" },
  "Kribbeln": { en: "Tingling", es: "Hormigueo", fr: "Picotement", it: "Formicolio", el: "Μυρμήγκιασμα", ru: "Покалывание", de: "Kribbeln" },
  "Absonderung": { en: "Discharge", es: "Secreción", fr: "Écoulement", it: "Secrezione", el: "Έκκριση", ru: "Выделения", de: "Absonderung" },
  "Urinieren": { en: "Urination", es: "Micción", fr: "Miction", it: "Minzione", el: "Ούρηση", ru: "Мочеиспускание", de: "Urinieren" },
  "Ruhelosigkeit": { en: "Restlessness", es: "Inquietud", fr: "Agitation", it: "Irrequietezza", el: "Ανησυχία", ru: "Беспокойство", de: "Ruhelosigkeit" },
  "Herzklopfen": { en: "Palpitations", es: "Palpitaciones", fr: "Palpitations", it: "Palpitazioni", el: "Αίσθημα παλμών", ru: "Сердцебиение", de: "Herzklopfen" },
  "Menses": { en: "Menses", es: "Menstruación", fr: "Règles", it: "Mestruazioni", el: "Έμμηνα", ru: "Менструация", de: "Menses" },
  "Trockenheit": { en: "Dryness", es: "Sequedad", fr: "Sécheresse", it: "Secchezza", el: "Ξηρότητα", ru: "Сухость", de: "Trockenheit" },
  "Stimme": { en: "Voice", es: "Voz", fr: "Voix", it: "Voce", el: "Φωνή", ru: "Голос", de: "Stimme" },
  "Schnupfen": { en: "Coryza", es: "Coriza", fr: "Coryza", it: "Corizza", el: "Κόρυζα", ru: "Насморк", de: "Schnupfen" },
  "Beklommenheit": { en: "Oppression", es: "Opresión", fr: "Oppression", it: "Oppressione", el: "Σφίξιμο", ru: "Стеснение", de: "Beklommenheit" },
  "Bewegung": { en: "Motion", es: "Movimiento", fr: "Mouvement", it: "Movimento", el: "Κίνηση", ru: "Движение", de: "Bewegung" },
  "Schläfrigkeit": { en: "Sleepiness", es: "Somnolencia", fr: "Somnolence", it: "Sonnolenza", el: "Υπνηλία", ru: "Сонливость", de: "Schläfrigkeit" },
  "Verstopfung": { en: "Constipation", es: "Estreñimiento", fr: "Constipation", it: "Stitichezza", el: "Δυσκοιλιότητα", ru: "Запор", de: "Verstopfung" },
  "Schwindelgefühl": { en: "Dizziness", es: "Mareo", fr: "Étourdissement", it: "Capogiro", el: "Ζαλάδα", ru: "Головокружение", de: "Schwindelgefühl" },
  "Appetit": { en: "Appetite", es: "Apetito", fr: "Appétit", it: "Appetito", el: "Όρεξη", ru: "Аппетит", de: "Appetit" },
  "Durst": { en: "Thirst", es: "Sed", fr: "Soif", it: "Sete", el: "Δίψα", ru: "Жажда", de: "Durst" },
  "Aversion": { en: "Aversion", es: "Aversión", fr: "Aversion", it: "Avversione", el: "Αποστροφή", ru: "Отвращение", de: "Aversion" },
  "Verlangen": { en: "Craving / Desire", es: "Deseo", fr: "Désir", it: "Desiderio", el: "Επιθυμία", ru: "Желание", de: "Verlangen" },

  // Pain Types & Sensations
  "stechender": { en: "stitching", es: "punzante", fr: "piquant", it: "pungente", el: "νυγμώδης / διαπεραστικός", ru: "колющий", de: "stechender" },
  "brennender": { en: "burning", es: "ardiente", fr: "brûlant", it: "bruciante", el: "καυστικός", ru: "жгучий", de: "brennender" },
  "drückender": { en: "pressing", es: "opresivo", fr: "pressant", it: "pressorio", el: "πιεστικός", ru: "давящий", de: "drückender" },
  "ziehender": { en: "drawing", es: "tirante", fr: "tiraillement", it: "tirante", el: "ελκυστικός", ru: "тянущий", de: "ziehender" },
  "reißender": { en: "tearing", es: "desgarrante", fr: "déchirant", it: "lacerante", el: "σχιστικός", ru: "рвущий", de: "reißender" },
  "wunder": { en: "sore", es: "endolorido", fr: "douloureux", it: "indolenzito", el: "πληγωμένος", ru: "болезненный", de: "wunder" },
  "schneidender": { en: "cutting", es: "cortante", fr: "coupant", it: "tagliente", el: "κοπτικός", ru: "режущий", de: "schneidender" },
  "weher": { en: "aching", es: "dolorido", fr: "endolori", it: "dolente", el: "πονεμένος", ru: "ноющий", de: "weher" },
  "wie zerschlagen": { en: "as if bruised", es: "como magullado", fr: "comme meurtri", it: "come contuso", el: "σαν χτυπημένος", ru: "как от ушиба", de: "wie zerschlagen" },
  "krampfartiger": { en: "cramping", es: "espasmódico", fr: "crampoïde", it: "spasmodico", el: "σπασμωδικός", ru: "судорожный", de: "krampfartiger" },
  "dumpfer": { en: "dull", es: "sordo", fr: "sourd", it: "sordo", el: "αμβλύς", ru: "тупой", de: "dumpfer" },
  "stechend": { en: "stitching", es: "punzante", fr: "piquant", it: "pungente", el: "νυγμώδης", ru: "колющий", de: "stechend" },
  "brennend": { en: "burning", es: "ardiente", fr: "brûlant", it: "bruciante", el: "καυστικός", ru: "жгучий", de: "brennend" },
  "drückend": { en: "pressing", es: "opresivo", fr: "pressant", it: "pressorio", el: "πιεστικός", ru: "давящий", de: "drückend" },

  // Modalities & Conditions
  "besser": { en: "better", es: "mejor", fr: "meilleur", it: "migliore", el: "βελτίωση", ru: "лучше", de: "besser" },
  "schlechter": { en: "worse", es: "peor", fr: "pire", it: "peggiore", el: "επιδείνωση", ru: "хуже", de: "schlechter" },
  "morgens": { en: "in the morning", es: "por la mañana", fr: "le matin", it: "al mattino", el: "το πρωί", ru: "утром", de: "morgens" },
  "abends": { en: "in the evening", es: "por la tarde / noche", fr: "le soir", it: "alla sera", el: "το βράδυ", ru: "вечером", de: "abends" },
  "nachts": { en: "at night", es: "por la noche", fr: "la nuit", it: "di notte", el: "τη νύχτα", ru: "ночью", de: "nachts" },
  "nachmittags": { en: "in the afternoon", es: "por la tarde", fr: "l'après-midi", it: "nel pomeriggio", el: "το απόγευμα", ru: "днем", de: "nachmittags" },
  "vormittags": { en: "in the forenoon", es: "por la mañana", fr: "dans la matinée", it: "nella mattinata", el: "πριν το μεσημέρι", ru: "до полудня", de: "vormittags" },
  "Mitternacht": { en: "Midnight", es: "Medianoche", fr: "Minuit", it: "Mezzanotte", el: "Μεσάνυχτα", ru: "Полночь", de: "Mitternacht" },
  "beim": { en: "during", es: "durante", fr: "pendant", it: "durante", el: "κατά", ru: "при", de: "beim" },
  "bei": { en: "during / with", es: "con / en", fr: "pendant", it: "durante", el: "κατά", ru: "при", de: "bei" },
  "nach": { en: "after", es: "después de", fr: "après", it: "dopo", el: "μετά από", ru: "после", de: "nach" },
  "vor": { en: "before", es: "antes de", fr: "avant", it: "prima di", el: "πριν από", ru: "перед", de: "vor" },
  "Gehen": { en: "Walking", es: "Caminar", fr: "Marcher", it: "Camminare", el: "Περπάτημα", ru: "Ходьба", de: "Gehen" },
  "beim Gehen": { en: "while walking", es: "al caminar", fr: "en marchant", it: "camminando", el: "στο περπάτημα", ru: "при ходьбе", de: "beim Gehen" },
  "Sitzen": { en: "Sitting", es: "Sentarse", fr: "Assis", it: "Seduto", el: "Κάθισμα", ru: "Сидение", de: "Sitzen" },
  "beim Sitzen": { en: "while sitting", es: "al sentarse", fr: "en position assise", it: "da seduto", el: "στο κάθισμα", ru: "сидя", de: "beim Sitzen" },
  "Liegen": { en: "Lying down", es: "Acostado", fr: "Couché", it: "Sdraiato", el: "Ξαπλωμένος", ru: "Лежа", de: "Liegen" },
  "im Bett": { en: "in bed", es: "en la cama", fr: "au lit", it: "a letto", el: "στο κρεβάτι", ru: "в постели", de: "im Bett" },
  "im Freien": { en: "in open air", es: "al aire libre", fr: "en plein air", it: "all'aria aperta", el: "στο ύπαιθρο", ru: "на свежем воздухе", de: "im Freien" },
  "im Zimmer": { en: "in a room", es: "en la habitación", fr: "dans une pièce", it: "nella stanza", el: "στο δωμάτιο", ru: "в комнате", de: "im Zimmer" },
  "Wärme": { en: "Warmth", es: "Calor", fr: "Chaleur", it: "Calore", el: "Ζέστη", ru: "Тепло", de: "Wärme" },
  "Ruhe": { en: "Rest", es: "Reposo", fr: "Repos", it: "Riposo", el: "Ανάπαυση", ru: "Покой", de: "Ruhe" },
  "Essen": { en: "Eating", es: "Comer", fr: "Manger", it: "Mangiare", el: "Φαγητό", ru: "Еда", de: "Essen" },
  "Trinken": { en: "Drinking", es: "Beber", fr: "Boire", it: "Bere", el: "Ποτό", ru: "Питье", de: "Trinken" },
  "Schlafen": { en: "Sleeping", es: "Dormir", fr: "Dormir", it: "Dormire", el: "Ύπνος", ru: "Сон", de: "Schlafen" },
  "Aufstehen": { en: "Rising", es: "Levantarse", fr: "Se lever", it: "Alzarsi", el: "Σήκωμα", ru: "Подъем", de: "Aufstehen" },
  "Bücken": { en: "Bending over", es: "Inclinarse", fr: "Se baisser", it: "Chinarsi", el: "Σκύψιμο", ru: "Наклон", de: "Bücken" },
  "Berührung": { en: "Touch", es: "Tacto / Contacto", fr: "Toucher", it: "Contatto", el: "Άγγιγμα", ru: "Прикосновение", de: "Berührung" },
  "Druck": { en: "Pressure", es: "Presión", fr: "Pression", it: "Pressione", el: "Πίεση", ru: "Давление", de: "Druck" },
  "Kratzen": { en: "Scratching", es: "Rascarse", fr: "Grattage", it: "Grattarsi", el: "Ξύσιμο", ru: "Расчесывание", de: "Kratzen" },
  "Zugluft": { en: "Draft of air", es: "Corriente de aire", fr: "Courant d'air", it: "Corrente d'aria", el: "Ρεύμα αέρα", ru: "Сквозняк", de: "Zugluft" },
  "Wetter": { en: "Weather", es: "Clima", fr: "Temps", it: "Tempo", el: "Καιρός", ru: "Погода", de: "Wetter" },

  // Anatomical Sub-locations
  "rechts": { en: "right", es: "derecha", fr: "droit", it: "destra", el: "δεξιά", ru: "справа", de: "rechts" },
  "links": { en: "left", es: "izquierda", fr: "gauche", it: "sinistra", el: "αριστερά", ru: "слева", de: "links" },
  "Seiten": { en: "sides", es: "lados", fr: "côtés", it: "lati", el: "πλευρές", ru: "стороны", de: "Seiten" },
  "Stirn": { en: "Forehead", es: "Frente", fr: "Front", it: "Fronte", el: "Μέτωπο", ru: "Лоб", de: "Stirn" },
  "Hinterkopf": { en: "Occiput", es: "Occipucio", fr: "Occiput", it: "Occipite", el: "Ινίο", ru: "Затылок", de: "Hinterkopf" },
  "Schläfen": { en: "Temples", es: "Sienes", fr: "Tempes", it: "Tempie", el: "Κρόταφοι", ru: "Виски", de: "Schläfen" },
  "Scheitel": { en: "Vertex", es: "Vértex", fr: "Sommet de la tête", it: "Vertice", el: "Κορυφή κεφαλής", ru: "Темечко", de: "Scheitel" },
  "Arme": { en: "Arms", es: "Brazos", fr: "Bras", it: "Braccia", el: "Βραχίονες", ru: "Руки", de: "Arme" },
  "Hand": { en: "Hand", es: "Mano", fr: "Main", it: "Mano", el: "Χέρι", ru: "Кисть", de: "Hand" },
  "Hände": { en: "Hands", es: "Manos", fr: "Mains", it: "Mani", el: "Χέρια", ru: "Руки", de: "Hände" },
  "Finger": { en: "Fingers", es: "Dedos", fr: "Doigts", it: "Dita", el: "Δάκτυλα", ru: "Пальцы", de: "Finger" },
  "Beine": { en: "Legs", es: "Piernas", fr: "Jambes", it: "Gambe", el: "Κνήμες", ru: "Ноги", de: "Beine" },
  "Oberschenkel": { en: "Thighs", es: "Muslos", fr: "Cuisses", it: "Cosce", el: "Μηροί", ru: "Бедра", de: "Oberschenkel" },
  "Unterschenkel": { en: "Lower legs", es: "Piernas inferiores", fr: "Jambes inférieures", it: "Gambe inferiori", el: "Κάτω άκρα", ru: "Голени", de: "Unterschenkel" },
  "Knie": { en: "Knees", es: "Rodillas", fr: "Genoux", it: "Ginocchia", el: "Γόνατα", ru: "Колени", de: "Knie" },
  "Fuß": { en: "Foot", es: "Pie", fr: "Pied", it: "Piede", el: "Πόδι", ru: "Стопа", de: "Fuß" },
  "Füße": { en: "Feet", es: "Pies", fr: "Pieds", it: "Piedi", el: "Πόδια", ru: "Стопы", de: "Füße" },
  "Zehen": { en: "Toes", es: "Dedos del pie", fr: "Orteils", it: "Dita dei piedi", el: "Δάχτυλα ποδιών", ru: "Пальцы ног", de: "Zehen" },
  "Schulter": { en: "Shoulder", es: "Hombro", fr: "Épaule", it: "Spalla", el: "Ώμος", ru: "Плечо", de: "Schulter" },
  "Hüfte": { en: "Hip", es: "Cadera", fr: "Hanche", it: "Anca", el: "Ισχίο", ru: "Бедро", de: "Hüfte" },
  "Lendenregion": { en: "Lumbar region", es: "Región lumbar", fr: "Région lombaire", it: "Regione lombare", el: "Οσφυϊκή χώρα", ru: "Поясничная область", de: "Lendenregion" },
  "Rückenregion": { en: "Back region", es: "Región de la espalda", fr: "Région du dos", it: "Regione dorsale", el: "Περιοχή ράχης", ru: "Область спины", de: "Rückenregion" },
  "Nacken": { en: "Nape of neck", es: "Nuca", fr: "Nuque", it: "Nuca", el: "Αυχένας", ru: "Затылок / Шея", de: "Nacken" }
};

export function getCanonicalKentTermTranslation(term: string, lang: LanguageCode): string | undefined {
  if (!term) return undefined;
  if (lang === 'de') return term;

  const direct = CANONICAL_KENT_TERMS[term]?.[lang];
  if (direct) return direct;

  const clean = term.trim();
  const directClean = CANONICAL_KENT_TERMS[clean]?.[lang];
  if (directClean) return directClean;

  // Case-insensitive lookup
  const lower = clean.toLowerCase();
  for (const [key, map] of Object.entries(CANONICAL_KENT_TERMS)) {
    if (key.toLowerCase() === lower && map[lang]) {
      return map[lang];
    }
  }

  return undefined;
}
