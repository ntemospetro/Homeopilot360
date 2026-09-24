import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

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

const EXCEL_PATH = path.resolve("./data/Kent_Repertorium_lesbar3.xlsx");
const CACHE_PATH = path.resolve("./data/kent_repertory_cache.json");

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
    if (fs.existsSync(CACHE_PATH)) {
      console.log(`[KENT_BACKEND] Loading Kent database from cache: ${CACHE_PATH}`);
      const rawData = fs.readFileSync(CACHE_PATH, "utf-8");
      const cache: KentCache = JSON.parse(rawData);
      cachedRubrics = cache.rubrics || [];
      cachedRemedies = cache.remedies || [];
      
      // Build remedyMap
      remedyMap = {};
      for (const rem of cachedRemedies) {
        remedyMap[rem.abbreviation.toLowerCase()] = rem.fullName;
        // Also map exact casing
        remedyMap[rem.abbreviation] = rem.fullName;
      }
      
      isLoaded = true;
      isLoading = false;
      console.log(`[KENT_BACKEND] Loaded ${cachedRubrics.length} rubrics and ${cachedRemedies.length} remedies from cache!`);
      return;
    }

    // 2. Otherwise parse XLSX using exceljs (which handles ZIP64 and is more robust)
    console.log(`[KENT_BACKEND] Cache not found. Parsing Excel file using exceljs: ${EXCEL_PATH}`);
    if (!fs.existsSync(EXCEL_PATH)) {
      throw new Error(`Excel file not found at ${EXCEL_PATH}`);
    }

    const start = Date.now();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_PATH);
    console.log(`[KENT_BACKEND] Read Excel file with exceljs in ${Date.now() - start}ms`);

    // Parse Sheet 2 (Mittelverzeichnis)
    console.log("[KENT_BACKEND] Parsing Sheet 2 (Mittelverzeichnis)...");
    const sheet2 = workbook.worksheets.find(
      (w) => w.name.toLowerCase().includes("mittel") || w.name.toLowerCase().includes("sheet2")
    ) || workbook.worksheets[1];

    if (!sheet2) {
      throw new Error("Mittelverzeichnis sheet not found in Excel workbook.");
    }

    cachedRemedies = [];
    sheet2.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip headers
      const abbreviation = String(row.getCell(1).value || "").trim();
      const fullName = String(row.getCell(2).value || "").trim();
      if (abbreviation) {
        cachedRemedies.push({ abbreviation, fullName });
      }
    });

    // Build remedyMap
    remedyMap = {};
    for (const rem of cachedRemedies) {
      remedyMap[rem.abbreviation.toLowerCase()] = rem.fullName;
      remedyMap[rem.abbreviation] = rem.fullName;
    }

    // Parse Sheet 1 (Kent komplett)
    console.log("[KENT_BACKEND] Parsing Sheet 1 (Kent komplett)... This might take a few seconds.");
    const sheet1 = workbook.worksheets.find(
      (w) => w.name.toLowerCase().includes("kent") || w.name.toLowerCase().includes("sheet1")
    ) || workbook.worksheets[0];

    if (!sheet1) {
      throw new Error("Kent komplett sheet not found in Excel workbook.");
    }

    cachedRubrics = [];
    sheet1.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip headers
      
      const id = String(row.getCell(1).value || rowNumber - 1).trim();
      const chapter = String(row.getCell(2).value || "").trim();
      const symptom = String(row.getCell(3).value || "").trim();

      // Extract zusatz 1-9 (Columns 4 to 12)
      const zusatz: string[] = [];
      for (let c = 4; c <= 12; c++) {
        const val = String(row.getCell(c).value || "").trim();
        if (val) {
          zusatz.push(val);
        }
      }

      const rawPath = String(row.getCell(13).value || "").trim();

      // Remedies are in columns 14, 15, 16
      const rem1 = String(row.getCell(14).value || "").trim();
      const rem2 = String(row.getCell(15).value || "").trim();
      const rem3 = String(row.getCell(16).value || "").trim();

      const remedies: { [key: string]: number } = {};

      const addRemediesWithGrade = (listStr: string, grade: number) => {
        if (!listStr) return;
        const tokens = listStr.split(",").map((t) => t.trim()).filter(Boolean);
        for (const token of tokens) {
          remedies[token] = grade;
        }
      };

      addRemediesWithGrade(rem1, 1);
      addRemediesWithGrade(rem2, 2);
      addRemediesWithGrade(rem3, 3);

      const remedyCount = Number(row.getCell(17).value || Object.keys(remedies).length);

      cachedRubrics.push({
        id,
        chapter,
        symptom,
        zusatz,
        path: rawPath || [chapter, symptom, ...zusatz].filter(Boolean).join(", "),
        remedies,
        remedyCount,
      });
    });

    // Save Cache
    const cacheData: KentCache = {
      rubrics: cachedRubrics,
      remedies: cachedRemedies,
    };

    console.log(`[KENT_BACKEND] Saving parsed database to cache at: ${CACHE_PATH}`);
    // Create data dir if not exists
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

/**
 * Search Kent Rubrics in memory using token matching
 */
export function searchKentRubrics(
  query: string,
  chapterFilter?: string,
  limit = 100
): KentRubric[] {
  if (!isLoaded) {
    ensureKentDatabaseLoaded();
    return [];
  }

  const queryClean = query.toLowerCase().trim();
  const tokens = queryClean.split(/\s+/).filter(Boolean);
  const chapterFilterClean = chapterFilter?.toLowerCase().trim();

  const results: KentRubric[] = [];

  for (const rubric of cachedRubrics) {
    // 1. Chapter filter check
    if (chapterFilterClean && rubric.chapter.toLowerCase() !== chapterFilterClean) {
      continue;
    }

    // 2. Token match check
    const pathLower = rubric.path.toLowerCase();
    let isMatch = true;

    for (const t of tokens) {
      if (!pathLower.includes(t)) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      results.push(rubric);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}

/**
 * Get the list of all remedies with abbreviations and full names
 */
export function getKentRemedies(): RemedyInfo[] {
  if (!isLoaded) {
    ensureKentDatabaseLoaded();
    return [];
  }
  return cachedRemedies;
}

/**
 * Get distinct chapters in Kent database
 */
export function getKentChapters(): string[] {
  if (!isLoaded) {
    ensureKentDatabaseLoaded();
    return [];
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
export function getKentRubricById(id: string): KentRubric | undefined {
  if (!isLoaded) {
    ensureKentDatabaseLoaded();
    return undefined;
  }
  return cachedRubrics.find((r) => r.id === id);
}

/**
 * Dynamic Drill-down helper for hierarchical symptom selection:
 * Chapter -> Symptom -> Zusatzangabe 1 -> Zusatzangabe 2 -> ... -> Zusatzangabe 9
 */
export function getKentDrilldown(
  chapter?: string,
  symptom?: string,
  zusatz: string[] = []
): {
  nextLevelType: string;
  nextLevelIndex: number;
  nextOptions: string[];
  rubrics: KentRubric[];
} {
  if (!isLoaded) {
    ensureKentDatabaseLoaded();
    return { nextLevelType: "chapter", nextLevelIndex: -1, nextOptions: [], rubrics: [] };
  }

  // 1. No chapter selected: return all chapters
  if (!chapter) {
    const chapters = getKentChapters();
    return {
      nextLevelType: "chapter",
      nextLevelIndex: -1,
      nextOptions: chapters,
      rubrics: [],
    };
  }

  // Filter to matching chapter
  let matching = cachedRubrics.filter(
    (r) => r.chapter.toLowerCase() === chapter.toLowerCase()
  );

  // 2. Chapter selected, but no symptom selected: return unique symptoms under this chapter
  if (!symptom) {
    const symptoms = new Set<string>();
    for (const r of matching) {
      if (r.symptom) {
        symptoms.add(r.symptom);
      }
    }
    return {
      nextLevelType: "symptom",
      nextLevelIndex: 0,
      nextOptions: Array.from(symptoms).sort(),
      rubrics: matching.slice(0, 100), // Show first 100 matching rubrics under this chapter
    };
  }

  // Filter to matching symptom
  matching = matching.filter(
    (r) => r.symptom.toLowerCase() === symptom.toLowerCase()
  );

  // 3. Process zusatz layers
  // zusatz is an array of selected sub-levels. e.g. ["abends", "im Bett"]
  const depth = zusatz.length;
  
  // Filter matching rubrics based on the zusatz selections so far
  for (let i = 0; i < depth; i++) {
    const valSelected = zusatz[i].toLowerCase();
    matching = matching.filter(
      (r) => r.zusatz[i] && r.zusatz[i].toLowerCase() === valSelected
    );
  }

  // Next options will be unique values at r.zusatz[depth] among the current filtered rubrics
  const nextOptionsSet = new Set<string>();
  for (const r of matching) {
    if (r.zusatz[depth]) {
      nextOptionsSet.add(r.zusatz[depth]);
    }
  }

  const nextOptions = Array.from(nextOptionsSet).sort();

  return {
    nextLevelType: nextOptions.length > 0 ? "zusatz" : "none",
    nextLevelIndex: depth,
    nextOptions,
    rubrics: matching, // All rubrics matching the full selected path so far
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
    ensureKentDatabaseLoaded();
    return [];
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
    for (const [remedyAbbrev, grade] of Object.entries(rubric.remedies)) {
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
