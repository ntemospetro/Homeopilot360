import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

export interface KentRubric {
  id: string; // Spalte A: Rubrik-ID
  chapter: string; // Spalte B: Beschwerde / Kapitel
  symptom: string; // Spalte C: Symptom
  zusatz: string[]; // Spalten D-L: Zusatzangaben 1-9
  path: string; // Spalte M: Originalpfad
  remedies: { [remedyKey: string]: number }; // remedyAbbreviation -> grade (1, 2, or 3)
  remedyCount: number;
}

export interface RemedyInfo {
  abbreviation: string;
  fullName: string;
}

interface KentCache {
  rubrics: KentRubric[];
  remedies: RemedyInfo[];
}

let cachedRubrics: KentRubric[] = [];
let cachedRemedies: RemedyInfo[] = [];
let remedyMap: Record<string, string> = {}; // abbreviation -> fullName
let isLoaded = false;
let isLoading = false;

const CACHE_PATH = path.resolve("./data/kent_repertory_cache.json");
const SQLITE_DB_PATH = fs.existsSync(path.resolve("./data/kent_repertory.db"))
  ? path.resolve("./data/kent_repertory.db")
  : path.resolve("./data/kent_repertory_sql.db");

/**
 * Normalizes remedies from various cache / DB representations:
 * { id, abbrev, name } or { abbreviation, fullName }
 */
function parseAndNormalizeRemedies(rawList: any[]): RemedyInfo[] {
  if (!Array.isArray(rawList)) return [];
  const normalized: RemedyInfo[] = [];
  const seen = new Set<string>();

  for (const rem of rawList) {
    if (!rem) continue;
    const abbrev = String(rem.abbreviation || rem.abbrev || rem.abbr || "").trim();
    if (!abbrev) continue;
    const fullName = String(rem.fullName || rem.name || rem.longname || abbrev).trim();
    const lower = abbrev.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      normalized.push({ abbreviation: abbrev, fullName });
    }
  }

  // Supplement from kent_remedies.json if available
  const REMEDIES_JSON_PATH = path.resolve("./data/kent_remedies.json");
  if (fs.existsSync(REMEDIES_JSON_PATH)) {
    try {
      const extra = JSON.parse(fs.readFileSync(REMEDIES_JSON_PATH, "utf-8"));
      if (Array.isArray(extra)) {
        for (const rem of extra) {
          if (!rem) continue;
          const abbrev = String(rem.abbreviation || rem.abbrev || "").trim();
          if (!abbrev) continue;
          const fullName = String(rem.fullName || rem.name || abbrev).trim();
          const lower = abbrev.toLowerCase();
          if (!seen.has(lower)) {
            seen.add(lower);
            normalized.push({ abbreviation: abbrev, fullName });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return normalized;
}

/**
 * Synchronous disk cache loader ensuring rubrics, remedies, and remedyMap are populated.
 */
function loadCacheFromDisk(): boolean {
  if (isLoaded) return true;
  if (!fs.existsSync(CACHE_PATH)) return false;

  console.log(`[KENT_BACKEND] Loading Kent database from cache: ${CACHE_PATH}`);
  const rawData = fs.readFileSync(CACHE_PATH, "utf-8");
  const cache: KentCache = JSON.parse(rawData);
  cachedRubrics = cache.rubrics || [];
  cachedRemedies = parseAndNormalizeRemedies(cache.remedies || []);

  // Build remedyMap
  remedyMap = {};
  for (const rem of cachedRemedies) {
    if (rem.abbreviation) {
      remedyMap[rem.abbreviation.toLowerCase()] = rem.fullName;
      remedyMap[rem.abbreviation] = rem.fullName;
    }
  }

  isLoaded = true;
  console.log(`[KENT_BACKEND] Loaded ${cachedRubrics.length} rubrics and ${cachedRemedies.length} remedies from cache!`);
  return true;
}

export async function ensureKentDatabaseLoaded(): Promise<void> {
  if (isLoaded) return;
  if (isLoading) {
    // Wait for loading to finish
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }

  isLoading = true;
  console.log("[KENT_BACKEND] Starting to load Kent Repertory database...");

  try {
    // 1. Check if JSON Cache exists
    if (loadCacheFromDisk()) {
      return;
    }

    // 2. Otherwise load from SQLite database
    console.log(`[KENT_BACKEND] Cache not found. Loading from SQLite database: ${SQLITE_DB_PATH}`);
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      throw new Error(`SQLite database not found at ${SQLITE_DB_PATH}`);
    }

    // @ts-ignore
    const Database = (await import("better-sqlite3")).default;
    const db = new Database(SQLITE_DB_PATH, { readonly: true });

    // 1. Load remedies
    const remRows = db.prepare("SELECT id, abbrev, longname FROM remedies ORDER BY id").all() as Array<{ id: number; abbrev: string; longname: string }>;
    const remMapById: Record<number, { abbrev: string; longname: string }> = {};
    cachedRemedies = [];
    remedyMap = {};

    for (const rem of remRows) {
      if (!rem || !rem.abbrev) continue;
      remMapById[rem.id] = { abbrev: rem.abbrev, longname: rem.longname || rem.abbrev };
      cachedRemedies.push({ abbreviation: rem.abbrev, fullName: rem.longname || rem.abbrev });
      remedyMap[rem.abbrev.toLowerCase()] = rem.longname || rem.abbrev;
      remedyMap[rem.abbrev] = rem.longname || rem.abbrev;
    }

    // 2. Load rubric_remedies
    const rrRows = db.prepare("SELECT rubric_id, remedy_id, grade FROM rubric_remedies").all() as Array<{ rubric_id: number; remedy_id: number; grade: number }>;
    const rubricRemMap: Record<number, Record<string, number>> = {};
    for (const rr of rrRows) {
      if (!rubricRemMap[rr.rubric_id]) rubricRemMap[rr.rubric_id] = {};
      const rInfo = remMapById[rr.remedy_id];
      if (rInfo && rInfo.abbrev) {
        rubricRemMap[rr.rubric_id][rInfo.abbrev] = rr.grade;
      }
    }

    // 3. Load rubrics
    const rubRows = db.prepare("SELECT id, chapter, symptom, zusatz_json, path, remedy_count FROM rubrics ORDER BY id").all() as Array<{ id: number; chapter: string; symptom: string; zusatz_json: string; path: string; remedy_count: number }>;
    cachedRubrics = [];
    for (const rub of rubRows) {
      const zusatz = JSON.parse(rub.zusatz_json || "[]");
      const remedies = rubricRemMap[rub.id] || {};
      cachedRubrics.push({
        id: String(rub.id),
        chapter: rub.chapter || "",
        symptom: rub.symptom || "",
        zusatz,
        path: rub.path || "",
        remedies,
        remedyCount: Object.keys(remedies).length
      });
    }
    db.close();

    // Save JSON Cache
    const cacheData: KentCache = {
      rubrics: cachedRubrics,
      remedies: cachedRemedies,
    };
    const dataDir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheData), "utf-8");
    isLoaded = true;
    console.log(`[KENT_BACKEND] Finished parsing and caching Kent database! Total: ${cachedRubrics.length} rubrics.`);
  } catch (err) {
    console.error("[KENT_BACKEND] Error loading Kent database:", err);
  } finally {
    isLoading = false;
  }
}

export const CANONICAL_KENT_CHAPTERS: Record<string, Record<string, string>> = {
  "Gemüt": { en: "Mind", es: "Mente", fr: "Mental", it: "Mente", el: "Νους", ru: "Психика" },
  "Schwindel": { en: "Vertigo", es: "Vértigo", fr: "Vertige", it: "Vertigine", el: "Ίλιγγος", ru: "Головокружение" },
  "Kopf": { en: "Head", es: "Cabeza", fr: "Tête", it: "Testa", el: "Κεφαλή", ru: "Голова" },
  "Auge": { en: "Eye", es: "Ojos", fr: "Yeux", it: "Occhi", el: "Οφθαλμοί", ru: "Глаза" },
  "Sehen": { en: "Vision", es: "Visión", fr: "Vision", it: "Vista", el: "Όραση", ru: "Зрение" },
  "Ohr": { en: "Ear", es: "Oído", fr: "Oreille", it: "Orecchio", el: "Ώτα", ru: "Уши" },
  "Gehör": { en: "Hearing", es: "Audición", fr: "Ouïe", it: "Udito", el: "Ακοή", ru: "Слух" },
  "Nase": { en: "Nose", es: "Nariz", fr: "Nez", it: "Naso", el: "Ρίς", ru: "Нос" },
  "Gesicht": { en: "Face", es: "Cara", fr: "Face", it: "Faccia", el: "Πρόσωπο", ru: "Лицо" },
  "Mund": { en: "Mouth", es: "Boca", fr: "Bouche", it: "Bocca", el: "Στόμα", ru: "Рот" },
  "Zähne": { en: "Teeth", es: "Dientes", fr: "Dents", it: "Denti", el: "Οδόντες", ru: "Зубы" },
  "Hals": { en: "Throat", es: "Garganta", fr: "Gorge", it: "Gola", el: "Λαιμός", ru: "Горло" },
  "Hals-Außenseite": { en: "External Throat & Neck", es: "Cuello externo", fr: "Gorge externe", it: "Collo esterno", el: "Εξωτερικός λαιμός", ru: "Шея снаружи" },
  "Magen": { en: "Stomach", es: "Estómago", fr: "Estomac", it: "Stomaco", el: "Στόμαχος", ru: "Желудок" },
  "Bauch": { en: "Abdomen", es: "Abdomen", fr: "Abdomen", it: "Addome", el: "Κοιλία", ru: "Живот" },
  "Mastdarm": { en: "Rectum", es: "Recto", fr: "Rectum", it: "Retto", el: "Απευθυσμένο", ru: "Прямая кишка" },
  "Stuhl": { en: "Stool", es: "Heces", fr: "Selles", it: "Feci", el: "Κόπρανα", ru: "Стул" },
  "Blase": { en: "Bladder", es: "Vejiga", fr: "Vessie", it: "Vescica", el: "Ουροδόχος κύστη", ru: "Мочевой пузырь" },
  "Nieren": { en: "Kidneys", es: "Riñones", fr: "Reins", it: "Reni", el: "Νεφροί", ru: "Почки" },
  "Prostata": { en: "Prostate", es: "Próstata", fr: "Prostate", it: "Prostata", el: "Προστάτης", ru: "Простата" },
  "Harnröhre": { en: "Urethra", es: "Uretra", fr: "Urètre", it: "Uretra", el: "Ουρήθρα", ru: "Уретра" },
  "Urin": { en: "Urine", es: "Orina", fr: "Urine", it: "Urina", el: "Ούρα", ru: "Моча" },
  "Geschlechtsorgane männlich": { en: "Male Genitalia", es: "Genitales masculinos", fr: "Organes génitaux masculins", it: "Genitali maschili", el: "Ανδρικά γεννητικά όργανα", ru: "Мужские половые органы" },
  "Geschlechtsorgane weiblich": { en: "Female Genitalia", es: "Genitales femeninos", fr: "Organes génitaux féminins", it: "Genitali femminili", el: "Γυναικεία γεννητικά όργανα", ru: "Женские половые органы" },
  "Kehlkopf und Luftröhre": { en: "Larynx & Trachea", es: "Laringe y tráquea", fr: "Larynx et trachée", it: "Laringe e trachea", el: "Λάρυγγας και τραχεία", ru: "Гортань и трахея" },
  "Atmung": { en: "Respiration", es: "Respiración", fr: "Respiration", it: "Respirazione", el: "Αναπνοή", ru: "Дыхание" },
  "Husten": { en: "Cough", es: "Tos", fr: "Toux", it: "Tosse", el: "Βήχας", ru: "Кашель" },
  "Auswurf": { en: "Expectoration", es: "Expectoración", fr: "Expectoration", it: "Espettorato", el: "Απόχρεμψη", ru: "Мокрота" },
  "Brust": { en: "Chest", es: "Pecho", fr: "Poitrine", it: "Torace", el: "Θώρακας", ru: "Грудная клетка" },
  "Rücken": { en: "Back", es: "Espalda", fr: "Dos", it: "Dorso", el: "Ράχη", ru: "Спина" },
  "Extremitäten": { en: "Extremities", es: "Extremidades", fr: "Membres", it: "Estremità", el: "Άκρα", ru: "Конечности" },
  "Schlaf": { en: "Sleep", es: "Sueño", fr: "Sommeil", it: "Sonno", el: "Ύπνος", ru: "Сон" },
  "Frost": { en: "Chill", es: "Escalofríos", fr: "Frissons", it: "Brividi", el: "Ρίγος", ru: "Озноб" },
  "Fieber": { en: "Fever", es: "Fiebre", fr: "Fièvre", it: "Febbre", el: "Πυρετός", ru: "Лихорадка" },
  "Schweiß": { en: "Perspiration", es: "Transpiración", fr: "Transpiration", it: "Sudorazione", el: "Ιδρώτας", ru: "Потливость" },
  "Haut": { en: "Skin", es: "Piel", fr: "Peau", it: "Pelle", el: "Δέρμα", ru: "Кожа" },
  "Allgemeines": { en: "Generals", es: "Generales", fr: "Généralités", it: "Generali", el: "Γενικά", ru: "Общие" }
};

export const CURATED_KENT_TERMS: Record<string, Record<string, string>> = {
  "Schmerz": { en: "Pain", es: "Dolor", fr: "Douleur", it: "Dolore", el: "Πόνος", ru: "Боль" },
  "Kopfschmerz": { en: "Headache", es: "Dolor de cabeza", fr: "Céphalée", it: "Mal di testa", el: "Κεφαλαλγία", ru: "Головная боль" },
  "Hautausschläge": { en: "Eruptions", es: "Erupciones", fr: "Éruptions", it: "Eruzioni", el: "Εξανθήματα", ru: "Высыпания" },
  "Schwäche": { en: "Weakness", es: "Debilidad", fr: "Faiblesse", it: "Debolezza", el: "Αδυναμία", ru: "Слабость" },
  "Jucken": { en: "Itching", es: "Picazón", fr: "Démangeaisons", it: "Prurito", el: "Κνησμός", ru: "Зуд" },
  "Verfärbung": { en: "Discoloration", es: "Decoloración", fr: "Décoloration", it: "Decolorazione", el: "Αποχρωματισμός", ru: "Изменение цвета" },
  "Kälte": { en: "Coldness", es: "Frío", fr: "Froid", it: "Freddo", el: "Κρυάδα", ru: "Холод" },
  "Wahnideen": { en: "Delusions", es: "Delirios", fr: "Délires", it: "Deliri", el: "Παραληρήματα", ru: "Бред" },
  "Hitze": { en: "Heat", es: "Calor", fr: "Chaleur", it: "Calore", el: "Ζέστη", ru: "Жар" },
  "Schwellung": { en: "Swelling", es: "Hinchazón", fr: "Gonflement", it: "Gonfiore", el: "Οίδημα", ru: "Отек" },
  "Zucken": { en: "Twitching", es: "Espasmos", fr: "Secousses", it: "Spasmi", el: "Σπασμοί", ru: "Подергивания" },
  "Krämpfe": { en: "Cramps", es: "Calambres", fr: "Crampes", it: "Crampi", el: "Κράμπες", ru: "Судороги" },
  "Geräusche": { en: "Noises", es: "Ruidos", fr: "Bruits", it: "Rumori", el: "Θόρυβοι", ru: "Шумы" },
  "Taubheitsgefühl": { en: "Numbness", es: "Entumecimiento", fr: "Engourdissement", it: "Intorpidimento", el: "Μούδιασμα", ru: "Онемение" },
  "Spannung": { en: "Tension", es: "Tensión", fr: "Tension", it: "Tensione", el: "Τάση", ru: "Напряжение" },
  "Schwere": { en: "Heaviness", es: "Pesadez", fr: "Lourdeur", it: "Pesantezza", el: "Βάρος", ru: "Тяжесть" },
  "Geschwüre": { en: "Ulcers", es: "Úlceras", fr: "Ulcères", it: "Ulcere", el: "Έλκη", ru: "Язвы" },
  "Erbrechen": { en: "Vomiting", es: "Vómitos", fr: "Vomissements", it: "Vomito", el: "Έμετος", ru: "Рвота" },
  "Aufstoßen": { en: "Eructations", es: "Eructos", fr: "Éructations", it: "Eruttazioni", el: "Ερυγές", ru: "Отрыжка" },
  "Zittern": { en: "Trembling", es: "Temblor", fr: "Tremblement", it: "Tremore", el: "Τρέμουλο", ru: "Дрожь" },
  "Zusammenschnüren": { en: "Constriction", es: "Constricción", fr: "Constriction", it: "Costrizione", el: "Σύσφιξη", ru: "Сжатие" },
  "Träume": { en: "Dreams", es: "Sueños", fr: "Rêves", it: "Sogni", el: "Όνειρα", ru: "Сны" },
  "pulsierend": { en: "Pulsating", es: "Pulsátil", fr: "Pulsatile", it: "Pulsante", el: "Παλλόμενος", ru: "Пульсирующий" },
  "Pulsieren": { en: "Pulsation", es: "Pulsación", fr: "Pulsation", it: "Pulsazione", el: "Σφυγμός", ru: "Пульсация" },
  "Diarrhoe": { en: "Diarrhea", es: "Diarrea", fr: "Diarrhée", it: "Diarrea", el: "Διάρροια", ru: "Диарея" },
  "Entzündung": { en: "Inflammation", es: "Inflamación", fr: "Inflammation", it: "Infiammazione", el: "Φλεγμονή", ru: "Воспаление" },
  "Schwitzen": { en: "Sweating", es: "Sudoración", fr: "Transpiration", it: "Sudorazione", el: "Ιδρώτας", ru: "Потоотделение" },
  "Steifheit": { en: "Stiffness", es: "Rigidez", fr: "Raideur", it: "Rigidità", el: "Δυσκαμψία", ru: "Скованность" },
  "Geschmack": { en: "Taste", es: "Gusto", fr: "Goût", it: "Gusto", el: "Γεύση", ru: "Вкус" },
  "Übelkeit": { en: "Nausea", es: "Náuseas", fr: "Nausée", it: "Nausea", el: "Ναυτία", ru: "Тошнота" },
  "Furcht": { en: "Fear", es: "Miedo", fr: "Peur", it: "Paura", el: "Φόβος", ru: "Страх" },
  "Angst": { en: "Anxiety", es: "Ansiedad", fr: "Anxiété", it: "Ansia", el: "Άγχος", ru: "Тревога" },
  "Lähmung": { en: "Paralysis", es: "Parálisis", fr: "Paralysie", it: "Paralisi", el: "Παράλυση", ru: "Паралич" },
  "schwierig": { en: "Difficult", es: "Difícil", fr: "Difficile", it: "Difficile", el: "Δύσκολος", ru: "Трудный" },
  "Kribbeln": { en: "Tingling", es: "Hormigueo", fr: "Picotement", it: "Formicolio", el: "Μυρμήγκιασμα", ru: "Покалывание" },
  "Absonderung": { en: "Discharge", es: "Secreción", fr: "Écoulement", it: "Secrezione", el: "Έκκριση", ru: "Выделения" },
  "Urinieren": { en: "Urination", es: "Micción", fr: "Miction", it: "Minzione", el: "Ούρηση", ru: "Мочеиспускание" },
  "Ruhelosigkeit": { en: "Restlessness", es: "Inquietud", fr: "Agitation", it: "Irrequietezza", el: "Ανησυχία", ru: "Беспокойство" },
  "Herzklopfen": { en: "Palpitations", es: "Palpitaciones", fr: "Palpitations", it: "Palpitazioni", el: "Αίσθημα παλμών", ru: "Сердцебиение" },
  "Menses": { en: "Menses", es: "Menstruación", fr: "Règles", it: "Mestruazioni", el: "Έμμηνα", ru: "Менструация" },
  "Trockenheit": { en: "Dryness", es: "Sequedad", fr: "Sécheresse", it: "Secchezza", el: "Ξηρότητα", ru: "Сухость" },
  "Stimme": { en: "Voice", es: "Voz", fr: "Voix", it: "Voce", el: "Φωνή", ru: "Голос" },
  "Schnupfen": { en: "Coryza", es: "Coriza", fr: "Coryza", it: "Corizza", el: "Κόρυζα", ru: "Насморк" },
  "Beklommenheit": { en: "Oppression", es: "Opresión", fr: "Oppression", it: "Oppressione", el: "Σφίξιμο", ru: "Стеснение" },
  "Bewegung": { en: "Motion", es: "Movimiento", fr: "Mouvement", it: "Movimento", el: "Κίνηση", ru: "Движение" },
  "Schläfrigkeit": { en: "Sleepiness", es: "Somnolencia", fr: "Somnolence", it: "Sonnolenza", el: "Υπνηλία", ru: "Сонливость" },
  "besser": { en: "better", es: "mejor", fr: "meilleur", it: "migliore", el: "καλύτερα", ru: "лучше" },
  "schlechter": { en: "worse", es: "peor", fr: "pire", it: "peggiore", el: "χειρότερα", ru: "хуже" },
  "stechender": { en: "stitching", es: "punzante", fr: "piquant", it: "pungente", el: "διαπεραστικός", ru: "колющий" },
  "morgens": { en: "in the morning", es: "por la mañana", fr: "le matin", it: "al mattino", el: "το πρωί", ru: "утром" },
  "abends": { en: "in the evening", es: "por la tarde", fr: "le soir", it: "alla sera", el: "το βράδυ", ru: "вечером" },
  "nachts": { en: "at night", es: "por la noche", fr: "la nuit", it: "di notte", el: "τη νύχτα", ru: "ночью" },
  "nachmittags": { en: "in the afternoon", es: "por la tarde", fr: "l'après-midi", it: "nel pomeriggio", el: "το απόγευμα", ru: "днем" },
  "vormittags": { en: "in the forenoon", es: "por la mañana", fr: "dans la matinée", it: "nella mattinata", el: "πριν το μεσημέρι", ru: "до полудня" },
  "bei": { en: "during", es: "con / en", fr: "pendant", it: "durante", el: "κατά", ru: "при" },
  "nach": { en: "after", es: "después de", fr: "après", it: "dopo", el: "μετά από", ru: "после" },
  "ziehender": { en: "drawing", es: "tirante", fr: "tiraillement", it: "tirante", el: "ελκυστικός", ru: "тянущий" },
  "reißender": { en: "tearing", es: "desgarrante", fr: "déchirant", it: "lacerante", el: "σχιστικός", ru: "рвущий" },
  "drückender": { en: "pressing", es: "opresivo", fr: "pressant", it: "pressorio", el: "πιεστικός", ru: "давящий" },
  "brennender": { en: "burning", es: "ardiente", fr: "brûlant", it: "bruciante", el: "καυστικός", ru: "жгучий" },
  "wunder": { en: "sore", es: "endolorido", fr: "douloureux", it: "indolenzito", el: "πληγωμένος", ru: "болезненный" },
  "schneidender": { en: "cutting", es: "cortante", fr: "coupant", it: "tagliente", el: "κοπτικός", ru: "режущий" },
  "weher": { en: "aching", es: "dolorido", fr: "endolori", it: "dolente", el: "πονεμένος", ru: "ноющий" },
  "wie zerschlagen": { en: "as if bruised", es: "como magullado", fr: "comme meurtri", it: "come contuso", el: "σαν χτυπημένος", ru: "как от ушиба" },
  "erstreckt sich": { en: "extending to", es: "se extiende a", fr: "s'étendant à", it: "si estende a", el: "επεκτείνεται", ru: "распространяется" },
  "während der": { en: "during", es: "durante la", fr: "pendant la", it: "durante la", el: "κατά τη διάρκεια", ru: "во время" },
  "beim Gehen": { en: "while walking", es: "al caminar", fr: "en marchant", it: "camminando", el: "στο περπάτημα", ru: "при ходьбе" },
  "Gehen": { en: "walking", es: "caminar", fr: "marcher", it: "camminare", el: "περπάτημα", ru: "ходьба" },
  "beim Sitzen": { en: "while sitting", es: "al sentarse", fr: "en position assise", it: "da seduto", el: "στο κάθισμα", ru: "сидя" },
  "beim Aufwachen": { en: "on waking", es: "al despertar", fr: "au réveil", it: "al risveglio", el: "στο ξύπνημα", ru: "при пробуждении" },
  "im Bett": { en: "in bed", es: "en la cama", fr: "au lit", it: "a letto", el: "στο κρεβάτι", ru: "в постели" },
  "Liegen": { en: "lying down", es: "acostado", fr: "en position couchée", it: "da sdraiato", el: "ξαπλωμένος", ru: "лежа" },
  "rechts": { en: "right", es: "derecha", fr: "droit", it: "destra", el: "δεξιά", ru: "справа" },
  "links": { en: "left", es: "izquierda", fr: "gauche", it: "sinistra", el: "αριστερά", ru: "слева" },
  "Seiten": { en: "sides", es: "lados", fr: "côtés", it: "lati", el: "πλευρές", ru: "стороны" },
  "Stirn": { en: "Forehead", es: "Frente", fr: "Front", it: "Fronte", el: "Μέτωπο", ru: "Лоб" },
  "Hinterkopf": { en: "Occiput", es: "Occipucio", fr: "Occiput", it: "Occipite", el: "Ινίο", ru: "Затылок" },
  "Schläfen": { en: "Temples", es: "Sienes", fr: "Tempes", it: "Tempie", el: "Κρόταφοι", ru: "Виски" },
  "Arme": { en: "Arms", es: "Brazos", fr: "Bras", it: "Braccia", el: "Βραχίονες", ru: "Руки" },
  "Hand": { en: "Hand", es: "Mano", fr: "Main", it: "Mano", el: "Χέρι", ru: "Кисть" },
  "Finger": { en: "Fingers", es: "Dedos", fr: "Doigts", it: "Dita", el: "Δάκτυλα", ru: "Пальцы" },
  "Beine": { en: "Legs", es: "Piernas", fr: "Jambes", it: "Gambe", el: "Κνήμες", ru: "Ноги" },
  "Oberschenkel": { en: "Thighs", es: "Muslos", fr: "Cuisses", it: "Cosce", el: "Μηροί", ru: "Бедра" },
  "Unterschenkel": { en: "Lower legs", es: "Piernas inferiores", fr: "Jambes inférieures", it: "Gambe inferiori", el: "Κάτω άκρα", ru: "Голени" },
  "Knie": { en: "Knees", es: "Rodillas", fr: "Genoux", it: "Ginocchia", el: "Γόνατα", ru: "Колени" },
  "Fuß": { en: "Foot", es: "Pie", fr: "Pied", it: "Piede", el: "Πόδι", ru: "Стопа" },
  "Zehen": { en: "Toes", es: "Dedos del pie", fr: "Orteils", it: "Dita dei piedi", el: "Δάχτυλα ποδιών", ru: "Пальцы ног" },
  "Schulter": { en: "Shoulder", es: "Hombro", fr: "Épaule", it: "Spalla", el: "Ώμος", ru: "Плечо" },
  "Hüfte": { en: "Hip", es: "Cadera", fr: "Hanche", it: "Anca", el: "Ισχίο", ru: "Бедро" },
  "Lendenregion": { en: "Lumbar region", es: "Región lumbar", fr: "Région lombaire", it: "Regione lombare", el: "Οσφυϊκή χώρα", ru: "Поясничная область" },
  "Rückenregion": { en: "Back region", es: "Región de la espalda", fr: "Région du dos", it: "Regione dorsale", el: "Περιοχή ράχης", ru: "Область спины" }
};

let translationsCache: Record<string, Record<string, string>> | null = null;
let saveDebounceTimer: NodeJS.Timeout | null = null;

function getTranslations(): Record<string, Record<string, string>> {
  if (translationsCache) return translationsCache;
  const transPath = path.resolve("./data/kent_translations.json");
  if (fs.existsSync(transPath)) {
    try {
      translationsCache = JSON.parse(fs.readFileSync(transPath, "utf-8"));
      return translationsCache!;
    } catch {
      translationsCache = {};
      return {};
    }
  }
  translationsCache = {};
  return {};
}

function persistTranslations(): void {
  if (!translationsCache) return;
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    try {
      const transPath = path.resolve("./data/kent_translations.json");
      fs.writeFileSync(transPath, JSON.stringify(translationsCache, null, 2), "utf-8");
    } catch (err) {
      console.error("[KENT_TRANS] Failed to save translations:", err);
    }
  }, 1000);
}

// Set to track in-flight translation terms to avoid redundant Gemini calls
const inFlightTerms = new Set<string>();

export type KentTokenUsageCallback = (usage: {
  promptTokens: number;
  candidatesTokens: number;
  cachedTokens?: number;
  model: string;
  actionName: string;
}) => void;

/**
 * Resilient Gemini caller with automatic fallback across multiple models
 * to handle temporary high demand spikes (503 / 429) seamlessly.
 */
async function generateWithMultiModelFallback(
  ai: GoogleGenAI,
  params: { contents: string; config?: any },
  timeoutMs = 20000
): Promise<{ text: string; usage: any; modelUsed: string } | null> {
  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest"];

  for (const model of candidateModels) {
    let timer: NodeJS.Timeout | undefined;
    try {
      const timeoutPromise = new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      });
      const genPromise = ai.models.generateContent({
        ...params,
        model,
      });

      const res: any = await Promise.race([genPromise, timeoutPromise]);
      if (timer) clearTimeout(timer);

      if (res && res.text) {
        return {
          text: res.text,
          usage: res.usageMetadata || {},
          modelUsed: model,
        };
      }
    } catch (err: any) {
      if (timer) clearTimeout(timer);
      const errMsg = String(err?.message || "");
      // If 503 high demand, 429 rate limit or unavailable, try next candidate
      if (
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("429") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("resource has been exhausted")
      ) {
        continue;
      }
      continue;
    }
  }
  return null;
}

export async function translateKentTerms(
  terms: string[], 
  lang: string, 
  onTokenUsage?: KentTokenUsageCallback
): Promise<Record<string, string>> {
  if (!lang || lang === "de" || !terms || terms.length === 0) return {};
  const trans = getTranslations();
  if (!trans[lang]) trans[lang] = {};

  const missing = Array.from(
    new Set(terms.filter((t) => t && !trans[lang][t] && !inFlightTerms.has(t)))
  );
  if (missing.length === 0) return trans[lang];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return trans[lang];

  // Process all missing terms in chunks of 45 terms so none are skipped
  const batchSize = 45;
  for (let i = 0; i < missing.length; i += batchSize) {
    const chunk = missing.slice(i, i + batchSize);
    for (const t of chunk) {
      inFlightTerms.add(t);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a licensed clinical and homeopathic repertory translator.
Translate the following German homeopathic repertory terms (symptoms, modalities, anatomical locations) accurately into "${lang}", "en", "es", "fr", "it", "el", "ru".
Return ONLY a valid JSON object where keys are the exact German terms and values are objects mapping each language code to its translation:
{"Term1": {"en": "...", "es": "...", "fr": "...", "it": "...", "el": "...", "ru": "..."}, ...}

German terms:
${JSON.stringify(chunk)}`;

      const result = await generateWithMultiModelFallback(
        ai,
        {
          contents: prompt,
          config: { responseMimeType: "application/json" }
        },
        9000
      );

      if (result && result.text) {
        const parsed = JSON.parse(result.text || "{}");
        for (const [orig, dict] of Object.entries(parsed)) {
          if (typeof dict === "object" && dict !== null) {
            for (const [l, val] of Object.entries(dict as any)) {
              if (!trans[l]) trans[l] = {};
              if (typeof val === "string" && val.trim()) {
                trans[l][orig] = val.trim();
              }
            }
          }
        }
        persistTranslations();
        // Invalidate in-memory translation caches so new translations take effect immediately
        for (const k of Object.keys(langTransCache)) {
          delete langTransCache[k];
        }

        // Trigger token usage callback for therapist billing
        if (onTokenUsage) {
          const usage = result.usage || {};
          onTokenUsage({
            promptTokens: usage.promptTokenCount || Math.ceil(prompt.length / 4),
            candidatesTokens: usage.candidatesTokenCount || Math.ceil(result.text.length / 4),
            cachedTokens: usage.cachedContentTokenCount || 0,
            model: result.modelUsed,
            actionName: `Repertorium Live-Übersetzung (${lang.toUpperCase()}: ${Object.keys(parsed).length} Begriffe)`,
          });
        }
      }
    } catch {
      // Non-blocking graceful fallback
    } finally {
      for (const t of chunk) {
        inFlightTerms.delete(t);
      }
    }
  }

  return trans[lang] || {};
}

interface LangTransData {
  transMap: Record<string, string>;
  lowerMap: Map<string, string>;
  reverseMap: Map<string, string[]>;
}

const langTransCache: Record<string, LangTransData> = {};

export function getKentTranslationsForLang(lang?: string): Record<string, string> {
  if (!lang || lang === "de") return {};

  if (langTransCache[lang]) {
    return langTransCache[lang].transMap;
  }

  const transMap: Record<string, string> = {};
  const lowerMap = new Map<string, string>();
  const reverseMap = new Map<string, string[]>();

  // 1. Canonical Kent Chapters (Level 1)
  for (const [ch, trans] of Object.entries(CANONICAL_KENT_CHAPTERS)) {
    if (trans[lang]) {
      transMap[ch] = trans[lang];
    }
  }

  // 2. Curated core symptoms and modalities
  for (const [term, trans] of Object.entries(CURATED_KENT_TERMS)) {
    if (trans[lang]) {
      transMap[term] = trans[lang];
    }
  }

  // 3. Dynamic dictionary from JSON file if available
  const allTrans = getTranslations();
  if (allTrans && allTrans[lang]) {
    Object.assign(transMap, allTrans[lang]);
  }

  for (const [orig, tr] of Object.entries(transMap)) {
    const origClean = orig.trim();
    const trClean = typeof tr === "string" ? tr.trim() : "";
    if (!origClean || !trClean) continue;

    lowerMap.set(origClean.toLowerCase(), trClean);
    const trLower = trClean.toLowerCase();
    const existing = reverseMap.get(trLower) || [];
    if (!existing.includes(origClean)) {
      existing.push(origClean);
    }
    reverseMap.set(trLower, existing);
  }

  langTransCache[lang] = { transMap, lowerMap, reverseMap };
  return transMap;
}

function capitalizeFirstLetter(val: string): string {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function lookupTrans(term: string, transMap: Record<string, string>, lang?: string): string {
  if (!term) return "";
  
  let result = term;
  if (transMap[term]) {
    result = transMap[term];
  } else {
    const trimmed = term.trim();
    if (transMap[trimmed]) {
      result = transMap[trimmed];
    } else {
      const cache = lang ? langTransCache[lang] : undefined;
      const lower = trimmed.toLowerCase();
      if (cache) {
        const directLower = cache.lowerMap.get(lower);
        if (directLower) {
          result = directLower;
        } else {
          result = lookupFallback(trimmed, transMap, cache);
        }
      } else {
        let found = false;
        for (const [k, v] of Object.entries(transMap)) {
          if (k.toLowerCase() === lower) {
            result = v;
            found = true;
            break;
          }
        }
        if (!found) {
          result = lookupFallback(trimmed, transMap);
        }
      }
    }
  }

  return capitalizeFirstLetter(result);
}

function lookupFallback(trimmed: string, transMap: Record<string, string>, cache?: LangTransData): string {
  // Word-by-word tokenized fallback for compound expressions
  if (trimmed.includes(" ") || trimmed.includes("-") || trimmed.includes(",")) {
    const tokens = trimmed.split(/(\b[A-Za-zÄÖÜäöüß0-9\-\'\.]+\b)/);
    let changed = false;
    const translatedTokens = tokens.map((part) => {
      if (/^[A-Za-zÄÖÜäöüß0-9\-\'\.]+$/.test(part)) {
        if (/^\d+[\-\d]*$/.test(part) || part === ".") return part;
        const wordTr = transMap[part] || (cache ? cache.lowerMap.get(part.toLowerCase()) : undefined);
        if (wordTr) {
          changed = true;
          return wordTr;
        }
      }
      return part;
    });
    if (changed) {
      return translatedTokens.join("");
    }
  }
  return trimmed;
}

interface DisambiguateContext {
  candidateRubrics?: KentRubric[];
  levelType?: 'chapter' | 'symptom' | 'zusatz';
  levelIndex?: number;
}

function toGermanTerm(
  term: string,
  transMap: Record<string, string>,
  lang?: string,
  context?: DisambiguateContext
): string {
  if (!term) return "";
  const termClean = term.trim();
  const termLower = termClean.toLowerCase();

  // Check canonical chapters
  for (const [deChapter, translations] of Object.entries(CANONICAL_KENT_CHAPTERS)) {
    if (deChapter.toLowerCase() === termLower) return deChapter;
    for (const val of Object.values(translations)) {
      if (typeof val === "string" && val.toLowerCase() === termLower) return deChapter;
    }
  }

  // If already an exact key in transMap
  if (transMap[termClean]) return termClean;

  const cache = lang ? langTransCache[lang] : undefined;
  let candidates: string[] = [];

  if (cache) {
    candidates = cache.reverseMap.get(termLower) || [];
  } else {
    for (const [orig, trans] of Object.entries(transMap)) {
      if (orig.toLowerCase() === termLower) return orig;
      if (typeof trans === "string" && trans.toLowerCase() === termLower) {
        if (!candidates.includes(orig)) candidates.push(orig);
      }
    }
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  if (candidates.length > 1) {
    // Disambiguate using context
    if (context?.candidateRubrics && context.candidateRubrics.length > 0) {
      if (context.levelType === 'symptom') {
        const match = candidates.find(cand =>
          context.candidateRubrics!.some(r => r.symptom && r.symptom.toLowerCase() === cand.toLowerCase())
        );
        if (match) return match;
      } else if (context.levelType === 'zusatz' && typeof context.levelIndex === 'number') {
        const idx = context.levelIndex;
        const match = candidates.find(cand =>
          context.candidateRubrics!.some(r => r.zusatz && r.zusatz[idx] && r.zusatz[idx].toLowerCase() === cand.toLowerCase())
        );
        if (match) return match;
      } else {
        const match = candidates.find(cand => {
          const cLower = cand.toLowerCase();
          return context.candidateRubrics!.some(r =>
            (r.chapter && r.chapter.toLowerCase() === cLower) ||
            (r.symptom && r.symptom.toLowerCase() === cLower) ||
            (Array.isArray(r.zusatz) && r.zusatz.some(z => z && z.toLowerCase() === cLower))
          );
        });
        if (match) return match;
      }
    }
    return candidates[0];
  }

  return termClean;
}

export function isModalityPrep(z?: string): boolean {
  if (!z) return false;
  const s = z.trim().toLowerCase();
  return (
    s.startsWith("nach ") || s.startsWith("nach dem") || s.startsWith("nach der") || s.startsWith("nach den") ||
    s.startsWith("beim ") || s.startsWith("bei ") ||
    s.startsWith("vor ") || s.startsWith("vor dem") || s.startsWith("vor der") || s.startsWith("vor den") ||
    s.startsWith("während ") || s.startsWith("während des") || s.startsWith("während der") ||
    s.startsWith("durch ") || s.includes("erscheinen der") || s.startsWith("mit ") || s.endsWith(", mit") ||
    s === "nach dem" || s === "vor dem" || s === "beim" || s === "nach den" || s === "vor den" || s === "mit" ||
    s.endsWith(", nach") || s.endsWith(", nach dem") || s.endsWith(", beim")
  );
}

export function formatNaturalRubricPath(
  chapter: string,
  symptom: string,
  zusatz: string[] = [],
  originalZusatz: string[] = []
): string {
  if (!symptom) return chapter || "";

  // Use the original German zusatz (if available) to determine the structural formatting logic
  // but use the passed strings (which might be translated) for the final output.
  const structuralZusatz = (originalZusatz && originalZusatz.length > 0) ? originalZusatz : zusatz;

  // Case 1: Inverted modality in zusatz[0] (e.g. "Husten", "Hämorrhoiden", ["nach Erscheinen der"])
  if (structuralZusatz.length > 0 && isModalityPrep(structuralZusatz[0])) {
    const mod = zusatz[0].trim();
    const remaining = zusatz.slice(1);
    const remStr = remaining.length > 0 ? ` (${remaining.join(", ")})` : "";

    if (structuralZusatz[0].toLowerCase().includes("nach erscheinen")) {
      return `${chapter} ➔ ${symptom} ${mod}${remStr}`;
    }

    if (
      structuralZusatz[0].startsWith("nach ") || structuralZusatz[0].startsWith("vor ") || structuralZusatz[0].startsWith("beim ") || 
      structuralZusatz[0].startsWith("während ") || structuralZusatz[0].startsWith("durch ") || structuralZusatz[0].startsWith("bei ")
    ) {
      return `${chapter} ➔ ${symptom} ${mod}${remStr}`;
    }

    if (structuralZusatz[0] === "nach dem" || structuralZusatz[0] === "vor dem" || structuralZusatz[0] === "beim" || structuralZusatz[0] === "nach den") {
      return `${chapter} ➔ ${symptom} ${mod}${remStr}`;
    }

    return `${chapter} ➔ ${symptom}: ${mod}${remStr}`;
  }

  // Case 2: zusatz has multiple items and one is a modality trigger (e.g. ["Essen", "nach dem"])
  if (structuralZusatz.length >= 2) {
    const triggers = ["nach dem", "beim", "vor dem", "nach den", "während", "bei", "durch", "nach", "vor", "mit"];
    const modIdx = structuralZusatz.findIndex(z => triggers.includes(z.toLowerCase().trim()));
    if (modIdx !== -1 && modIdx > 0) {
      const mod = zusatz[modIdx];
      const trigger = zusatz[modIdx - 1];
      const before = zusatz.slice(0, modIdx - 1);
      const after = zusatz.slice(modIdx + 1);
      const rem = [...before, ...after];
      const remStr = rem.length > 0 ? ` (${rem.join(", ")})` : "";
      return `${chapter} ➔ ${symptom} ${mod} ${trigger}${remStr}`;
    }
  }

  const allParts = [chapter, symptom, ...zusatz].filter(Boolean);
  return allParts.join(" ➔ ");
}

function translateRubric(
  r: KentRubric,
  transMap: Record<string, string>,
  lang?: string,
  orderMode: "classic" | "natural" = "classic"
): any {
  if (!transMap || Object.keys(transMap).length === 0) {
    const pathClassic = r.path;
    const pathNatural = formatNaturalRubricPath(r.chapter, r.symptom, r.zusatz || []);
    return {
      ...r,
      pathClassic,
      pathNatural,
      pathTranslated: orderMode === "natural" ? pathNatural : pathClassic
    };
  }

  const chapterTranslated = lookupTrans(r.chapter, transMap, lang) || r.chapter;
  const symptomTranslated = lookupTrans(r.symptom, transMap, lang) || r.symptom;
  const zusatzTranslated = (r.zusatz || []).map((z) => lookupTrans(z, transMap, lang) || z);

  const pathParts = [chapterTranslated, symptomTranslated, ...zusatzTranslated].filter(Boolean);
  const pathClassic = pathParts.length > 0 ? pathParts.join(" ➔ ") : r.path;
  const pathNatural = formatNaturalRubricPath(chapterTranslated, symptomTranslated, zusatzTranslated, r.zusatz);

  return {
    ...r,
    chapterTranslated,
    symptomTranslated,
    zusatzTranslated,
    pathClassic,
    pathNatural,
    pathTranslated: orderMode === "natural" ? pathNatural : pathClassic
  };
}

/**
 * Search Kent Rubrics in memory using token matching with multi-lingual support
 */
export async function searchKentRubrics(
  query: string,
  chapterFilter?: string,
  limit = 100,
  lang = "de",
  onTokenUsage?: KentTokenUsageCallback,
  orderMode: "classic" | "natural" = "classic"
): Promise<any[]> {
  if (!isLoaded) {
    await ensureKentDatabaseLoaded();
  }

  const queryClean = query.toLowerCase().trim();
  const tokens = queryClean.split(/\s+/).filter(Boolean);
  let transMap = getKentTranslationsForLang(lang);
  const chapterFilterNorm = chapterFilter ? toGermanTerm(chapterFilter.trim(), transMap, lang).toLowerCase() : undefined;

  // Build list of equivalent search tokens (original token + any corresponding German words)
  const cache = langTransCache[lang];
  const tokenEquivalents: string[][] = tokens.map((t) => {
    const list = [t];
    if (lang !== "de" && cache) {
      const cands = cache.reverseMap.get(t);
      if (cands) {
        for (const c of cands) list.push(c.toLowerCase());
      }
      for (const [trLower, origList] of cache.reverseMap.entries()) {
        if (
          trLower === t ||
          trLower.startsWith(t + " ") ||
          trLower.endsWith(" " + t) ||
          trLower.includes(" " + t + " ") ||
          (t.length >= 4 && trLower.includes(t))
        ) {
          for (const orig of origList) list.push(orig.toLowerCase());
        }
      }
    }
    return Array.from(new Set(list));
  });

  // If query tokens don't match any German words in our dictionary, or if it's a natural language query,
  // query Gemini for medical equivalents to enable natural language search for all users.
  if (tokens.length > 0 && process.env.GEMINI_API_KEY) {
    const hasAnyEquivalent = lang !== "de" ? tokenEquivalents.some((eq) => eq.length > 1) : false;
    const isNaturalQuery = queryClean.includes(" ") || queryClean.length > 10;

    if (!hasAnyEquivalent || isNaturalQuery) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const qRes = await generateWithMultiModelFallback(
          ai,
          {
            contents: `Identify the core homeopathic components (Chapter, Symptom, Modality) from this query in "${lang}": "${queryClean}". Return ONLY a JSON array of the 1 to 4 most important German keywords (as used in Kent's Repertory) that MUST all be present. Example for "stabbing headache in the morning": ["kopf", "schmerz", "stechend", "morgens"].`,
            config: { responseMimeType: "application/json" }
          },
          4000
        );
        if (qRes && qRes.text) {
          const germanKeywords = JSON.parse(qRes.text || "[]");
          if (Array.isArray(germanKeywords) && germanKeywords.length > 0) {
            // Treat AI keywords as separate requirements (AND) to ensure precision
            for (const kw of germanKeywords) {
              const cleanKw = String(kw).toLowerCase().trim();
              if (cleanKw.length > 1) {
                tokenEquivalents.push([cleanKw]);
              }
            }
          }
          if (onTokenUsage) {
            const qUsage = qRes.usage || {};
            onTokenUsage({
              promptTokens: qUsage.promptTokenCount || Math.ceil(queryClean.length / 4),
              candidatesTokens: qUsage.candidatesTokenCount || 20,
              cachedTokens: qUsage.cachedContentTokenCount || 0,
              model: qRes.modelUsed,
              actionName: `Repertorium Suchbegriff-Übersetzung (${lang.toUpperCase()}: "${queryClean}")`,
            });
          }
        }
      } catch {
        // Non-blocking fallback
      }
    }
  }

  const rawMatches: KentRubric[] = [];

  for (const rubric of cachedRubrics) {
    // 1. Chapter filter check
    if (chapterFilterNorm && (!rubric.chapter || rubric.chapter.toLowerCase() !== chapterFilterNorm)) {
      continue;
    }

    // 2. Token match check
    const pathLower = (rubric.path || "").toLowerCase();
    let isMatch = true;

    if (tokens.length > 0) {
      for (const equivs of tokenEquivalents) {
        const matchesOne = equivs.some((eq) => pathLower.includes(eq));
        if (!matchesOne) {
          isMatch = false;
          break;
        }
      }
    }

    if (isMatch) {
      rawMatches.push(rubric);
      if (rawMatches.length >= limit) {
        break;
      }
    }
  }

  // Ensure all matching rubrics have their terms translated
  if (lang !== "de" && rawMatches.length > 0) {
    const missingTerms: string[] = [];
    for (const r of rawMatches.slice(0, 50)) {
      if (r.symptom && !transMap[r.symptom]) missingTerms.push(r.symptom);
      if (Array.isArray(r.zusatz)) {
        for (const z of r.zusatz) {
          if (z && !transMap[z]) missingTerms.push(z);
        }
      }
    }
    const uniqueMissing = Array.from(new Set(missingTerms));
    if (uniqueMissing.length > 0) {
      await translateKentTerms(uniqueMissing, lang, onTokenUsage);
      transMap = getKentTranslationsForLang(lang);
    }
  }

  return rawMatches.map((rubric) => translateRubric(rubric, transMap, lang, orderMode));
}

/**
 * Get the list of all remedies with abbreviations and full names
 */
export function getKentRemedies(): RemedyInfo[] {
  if (!isLoaded) {
    loadCacheFromDisk();
  }
  return cachedRemedies;
}

/**
 * Get distinct chapters in Kent database
 */
export function getKentChapters(): string[] {
  if (!isLoaded) {
    loadCacheFromDisk();
  }
  const chapters = new Set<string>();
  for (const r of cachedRubrics) {
    if (r.chapter) {
      chapters.add(r.chapter);
    }
  }
  return Array.from(chapters).sort();
}

/**
 * Get a single rubric by ID
 */
export function getKentRubricById(id: string, lang = "de"): any | undefined {
  if (!isLoaded) {
    loadCacheFromDisk();
  }
  const found = cachedRubrics.find((r) => r.id === id);
  if (!found) return undefined;
  const transMap = getKentTranslationsForLang(lang);
  return translateRubric(found, transMap, lang);
}

/**
 * Dynamic Drill-down helper for hierarchical symptom selection:
 * Chapter -> Symptom -> Zusatzangabe 1 -> Zusatzangabe 2 -> ... -> Zusatzangabe 9
 */
export async function getKentDrilldown(
  chapter?: string,
  symptom?: string,
  zusatz: string[] = [],
  lang = "de",
  onTokenUsage?: KentTokenUsageCallback,
  orderMode: "classic" | "natural" = "classic"
): Promise<{
  nextLevelType: string;
  nextLevelIndex: number;
  nextOptions: string[];
  translatedOptions?: Record<string, string>;
  pathTranslations?: Record<string, string>;
  rubrics: any[];
}> {
  if (!isLoaded) {
    await ensureKentDatabaseLoaded();
  }

  let transMap = getKentTranslationsForLang(lang);
  const normalizedChapter = chapter ? toGermanTerm(chapter.trim(), transMap, lang, { levelType: 'chapter' }) : "";

  // 1. No chapter selected: return all chapters
  if (!normalizedChapter) {
    const chaptersList = getKentChapters();
    const translatedOptions: Record<string, string> = {};
    for (const ch of chaptersList) {
      translatedOptions[ch] = lookupTrans(ch, transMap, lang) || ch;
    }

    // Sort options by their translated names
    chaptersList.sort((a, b) => {
      const transA = translatedOptions[a] || a;
      const transB = translatedOptions[b] || b;
      return transA.localeCompare(transB, lang === 'de' ? 'de' : lang);
    });

    return {
      nextLevelType: "chapter",
      nextLevelIndex: -1,
      nextOptions: chaptersList,
      translatedOptions,
      pathTranslations: {},
      rubrics: [],
    };
  }

  // Filter to matching chapter
  let matching = cachedRubrics.filter(
    (r) => (r.chapter || "").toLowerCase() === normalizedChapter.toLowerCase()
  );

  // Build pathTranslations for breadcrumbs
  const pathTranslations: Record<string, string> = {};
  if (normalizedChapter) {
    pathTranslations[normalizedChapter] = lookupTrans(normalizedChapter, transMap, lang);
    if (chapter) pathTranslations[chapter] = pathTranslations[normalizedChapter];
  }

  // 2. Chapter selected, but no symptom selected
  if (!symptom) {
    const optionsSet = new Set<string>();

    if (orderMode === "natural") {
      // Natural mode: Inverted modalities in zusatz[0] appear directly at level 1
      for (const r of matching) {
        if (r.zusatz && r.zusatz[0] && isModalityPrep(r.zusatz[0])) {
          optionsSet.add(r.zusatz[0]);
        } else if (r.symptom) {
          optionsSet.add(r.symptom);
        }
      }
    } else {
      // Classic mode: Always r.symptom
      for (const r of matching) {
        if (r.symptom) {
          optionsSet.add(r.symptom);
        }
      }
    }

    const optionsList = Array.from(optionsSet);

    // Check for missing translations
    if (lang !== "de") {
      const missingOpts = optionsList.filter((s) => !transMap[s]);
      if (missingOpts.length > 0) {
        await translateKentTerms(missingOpts, lang, onTokenUsage);
        transMap = getKentTranslationsForLang(lang);
      }
    }

    const translatedOptions: Record<string, string> = {};
    for (const opt of optionsList) {
      translatedOptions[opt] = lookupTrans(opt, transMap, lang) || opt;
    }

    // Sort options by their translated names
    optionsList.sort((a, b) => {
      const transA = translatedOptions[a] || a;
      const transB = translatedOptions[b] || b;
      return transA.localeCompare(transB, lang === 'de' ? 'de' : lang);
    });

    return {
      nextLevelType: "symptom",
      nextLevelIndex: 0,
      nextOptions: optionsList,
      translatedOptions,
      pathTranslations,
      rubrics: matching.slice(0, 100).map((r) => translateRubric(r, transMap, lang, orderMode)),
    };
  }

  const normalizedSymptom = toGermanTerm(symptom.trim(), transMap, lang, { candidateRubrics: matching, levelType: 'symptom' });
  const isInvModal =
    orderMode === "natural" &&
    (isModalityPrep(normalizedSymptom) ||
      matching.some(
        (r) =>
          r.zusatz &&
          r.zusatz[0] &&
          r.zusatz[0].toLowerCase() === normalizedSymptom.toLowerCase()
      ));

  if (isInvModal) {
    // Filter to rubrics that have this inverted modality in zusatz[0]
    matching = matching.filter(
      (r) =>
        r.zusatz &&
        r.zusatz[0] &&
        r.zusatz[0].toLowerCase() === normalizedSymptom.toLowerCase()
    );

    pathTranslations[normalizedSymptom] = lookupTrans(normalizedSymptom, transMap, lang);
    if (symptom) pathTranslations[symptom] = pathTranslations[normalizedSymptom];

    if (!zusatz || zusatz.length === 0) {
      // Step 2 in natural mode: show triggering symptoms/organs under this modality
      const nextSymptoms = Array.from(new Set(matching.map((r) => r.symptom).filter(Boolean)));

      if (lang !== "de") {
        const missing = nextSymptoms.filter((s) => !transMap[s]);
        if (missing.length > 0) {
          await translateKentTerms(missing, lang, onTokenUsage);
          transMap = getKentTranslationsForLang(lang);
        }
      }

      const translatedOptions: Record<string, string> = {};
      for (const s of nextSymptoms) {
        translatedOptions[s] = lookupTrans(s, transMap, lang) || s;
      }

      nextSymptoms.sort((a, b) => {
        const transA = translatedOptions[a] || a;
        const transB = translatedOptions[b] || b;
        return transA.localeCompare(transB, lang === 'de' ? 'de' : lang);
      });

      return {
        nextLevelType: "zusatz",
        nextLevelIndex: 0,
        nextOptions: nextSymptoms,
        translatedOptions,
        pathTranslations,
        rubrics: matching.slice(0, 100).map((r) => translateRubric(r, transMap, lang, orderMode)),
      };
    }

    // Step 3 in natural mode: filter by selected symptom (in zusatz[0])
    const rawSymptomVal = zusatz[0];
    const normSymptomVal = toGermanTerm(rawSymptomVal.trim(), transMap, lang, { candidateRubrics: matching, levelType: 'symptom' });
    pathTranslations[normSymptomVal] = lookupTrans(normSymptomVal, transMap, lang);
    if (rawSymptomVal) pathTranslations[rawSymptomVal] = pathTranslations[normSymptomVal];

    matching = matching.filter(
      (r) => r.symptom && r.symptom.toLowerCase() === normSymptomVal.toLowerCase()
    );

    // Remaining deeper zusatz levels beyond the symptom
    const remainingZusatz = zusatz.slice(1);
    for (let i = 0; i < remainingZusatz.length; i++) {
      const rawVal = remainingZusatz[i];
      const normVal = toGermanTerm(rawVal.trim(), transMap, lang, { candidateRubrics: matching, levelType: 'zusatz', levelIndex: i + 1 });
      pathTranslations[normVal] = lookupTrans(normVal, transMap, lang);
      if (rawVal) pathTranslations[rawVal] = pathTranslations[normVal];
      matching = matching.filter(
        (r) => r.zusatz && r.zusatz[i + 1] && r.zusatz[i + 1].toLowerCase() === normVal.toLowerCase()
      );
    }

    const nextDepth = remainingZusatz.length + 1; // index in r.zusatz
    const nextOptionsSet = new Set<string>();
    for (const r of matching) {
      if (r.zusatz && r.zusatz[nextDepth]) {
        nextOptionsSet.add(r.zusatz[nextDepth]);
      }
    }
    const nextOptions = Array.from(nextOptionsSet);

    if (lang !== "de" && nextOptions.length > 0) {
      const missing = nextOptions.filter((z) => !transMap[z]);
      if (missing.length > 0) {
        await translateKentTerms(missing, lang, onTokenUsage);
        transMap = getKentTranslationsForLang(lang);
      }
    }

    const translatedOptions: Record<string, string> = {};
    for (const opt of nextOptions) {
      translatedOptions[opt] = lookupTrans(opt, transMap, lang) || opt;
    }

    nextOptions.sort((a, b) => {
      const transA = translatedOptions[a] || a;
      const transB = translatedOptions[b] || b;
      return transA.localeCompare(transB, lang === 'de' ? 'de' : lang);
    });

    return {
      nextLevelType: nextOptions.length > 0 ? "zusatz" : "none",
      nextLevelIndex: zusatz.length,
      nextOptions,
      translatedOptions,
      pathTranslations,
      rubrics: matching.slice(0, 150).map((r) => translateRubric(r, transMap, lang, orderMode)),
    };
  }

  // Standard classic symptom path (or non-inverted symptom in natural mode)
  matching = matching.filter(
    (r) => (r.symptom || "").toLowerCase() === normalizedSymptom.toLowerCase()
  );

  if (normalizedSymptom) {
    pathTranslations[normalizedSymptom] = lookupTrans(normalizedSymptom, transMap, lang);
    if (symptom) pathTranslations[symptom] = pathTranslations[normalizedSymptom];
  }

  // Process zusatz layers with context-aware disambiguation
  const depth = (zusatz || []).length;
  const normalizedZusatz: string[] = [];
  
  for (let i = 0; i < depth; i++) {
    const rawVal = zusatz[i];
    const normVal = toGermanTerm(rawVal.trim(), transMap, lang, { candidateRubrics: matching, levelType: 'zusatz', levelIndex: i });
    normalizedZusatz.push(normVal);
    const valSelected = normVal.toLowerCase();
    matching = matching.filter(
      (r) => r.zusatz[i] && r.zusatz[i].toLowerCase() === valSelected
    );
    const tr = lookupTrans(normVal, transMap, lang);
    pathTranslations[normVal] = tr;
    if (rawVal) pathTranslations[rawVal] = tr;
  }

  const nextOptionsSet = new Set<string>();
  for (const r of matching) {
    if (r.zusatz[depth]) {
      nextOptionsSet.add(r.zusatz[depth]);
    }
  }

  const nextOptions = Array.from(nextOptionsSet);

  // If language is not German, ensure missing zusatz options and rubric items are translated
  if (lang !== "de") {
    const missingZusatz = nextOptions.filter((z) => !transMap[z]);
    const missingInRubrics: string[] = [];
    for (const r of matching.slice(0, 60)) {
      if (r.symptom && !transMap[r.symptom]) missingInRubrics.push(r.symptom);
      if (Array.isArray(r.zusatz)) {
        for (const z of r.zusatz) {
          if (z && !transMap[z]) missingInRubrics.push(z);
        }
      }
    }
    const immediateMissing = Array.from(new Set([...missingZusatz, ...missingInRubrics]));
    if (immediateMissing.length > 0) {
      await translateKentTerms(immediateMissing, lang, onTokenUsage);
      transMap = getKentTranslationsForLang(lang);
    }
  }

  const translatedOptions: Record<string, string> = {};
  for (const opt of nextOptions) {
    translatedOptions[opt] = lookupTrans(opt, transMap, lang) || opt;
  }

  // Sort options by their translated names
  nextOptions.sort((a, b) => {
    const transA = translatedOptions[a] || a;
    const transB = translatedOptions[b] || b;
    return transA.localeCompare(transB, lang === 'de' ? 'de' : lang);
  });

  return {
    nextLevelType: nextOptions.length > 0 ? "zusatz" : "none",
    nextLevelIndex: depth,
    nextOptions,
    translatedOptions,
    pathTranslations,
    rubrics: matching.slice(0, 150).map((r) => translateRubric(r, transMap, lang, orderMode)),
  };
}

export interface KentRepertorizationResult {
  remedyKey: string; // e.g. Acon. or Acon
  fullName: string; // e.g. Aconitum Napellus
  hits: number; // Symptomdeckung (how many selected rubrics are covered)
  score: number; // Summe der Grade (weighted by grades: Grade 1=1, 2=2, 3=3)
  gradesPerRubric: { [rubricId: string]: number }; // Maps rubricId -> grade (1, 2, or 3, or 0 if not present)
  totalSelectedRubrics: number;
}

/**
 * Perform repertorisation scoring
 */
export function performKentRepertorisation(
  selectedRubricIds: string[]
): KentRepertorizationResult[] {
  if (!isLoaded) {
    loadCacheFromDisk();
  }

  const validRubricIds = selectedRubricIds.filter(Boolean);
  if (validRubricIds.length === 0) {
    return [];
  }

  // Find all matched rubrics
  const matchedRubrics: KentRubric[] = [];
  for (const rid of validRubricIds) {
    const rub = cachedRubrics.find((r) => r.id === rid);
    if (rub) {
      matchedRubrics.push(rub);
    }
  }

  // Map to store intermediate results for each remedy
  // remedyKey (lowercase) -> accumulated data
  const remedyScores: Record<
    string,
    {
      remedyKey: string;
      fullName: string;
      hits: number;
      score: number;
      gradesPerRubric: { [rubricId: string]: number };
    }
  > = {};

  for (const rubric of matchedRubrics) {
    for (const [remedyAbbrev, grade] of Object.entries(rubric.remedies || {})) {
      if (!remedyAbbrev) continue;
      const keyLower = remedyAbbrev.toLowerCase();
      
      // Initialize if not present
      if (!remedyScores[keyLower]) {
        // Find full name from our map
        const fullName = remedyMap[keyLower] || remedyMap[remedyAbbrev] || remedyAbbrev;
        remedyScores[keyLower] = {
          remedyKey: remedyAbbrev, // keep original abbreviation case if possible
          fullName,
          hits: 0,
          score: 0,
          gradesPerRubric: {},
        };
      }

      const remData = remedyScores[keyLower];
      remData.hits += 1;
      remData.score += grade;
      remData.gradesPerRubric[rubric.id] = grade;
    }
  }

  // Convert to array and format results
  const results: KentRepertorizationResult[] = Object.values(remedyScores).map((data) => {
    // Fill in 0 grades for rubrics this remedy does NOT have
    const finalGrades: { [rubricId: string]: number } = {};
    for (const rub of matchedRubrics) {
      finalGrades[rub.id] = data.gradesPerRubric[rub.id] || 0;
    }

    return {
      remedyKey: data.remedyKey,
      fullName: data.fullName,
      hits: data.hits,
      score: data.score,
      gradesPerRubric: finalGrades,
      totalSelectedRubrics: matchedRubrics.length,
    };
  });

  // Sort by hits descending (primary), then score descending (secondary), then alphabetically
  results.sort((a, b) => {
    if (b.hits !== a.hits) {
      return b.hits - a.hits;
    }
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.remedyKey.localeCompare(b.remedyKey);
  });

  return results;
}
