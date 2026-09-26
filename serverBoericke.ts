import path from "path";
import fs from "fs";

export interface BoerickeRemedy {
  id: number;
  abbrev: string;
  name: string;
}

export interface BoerickeSection {
  heading: string;
  content: string;
  depth: number;
}

export interface BoerickeMonographData {
  title: string;
  sections: BoerickeSection[];
}

interface BoerickeData {
  remedies: BoerickeRemedy[];
  materiaMedica: Record<string, BoerickeMonographData>;
}

const JSON_PATH = path.join(process.cwd(), "data", "boericke_mm.json");

let loadedData: BoerickeData | null = null;
let lookupMap = new Map<string, BoerickeRemedy>();
let isLoaded = false;
let isLoading = false;

export async function ensureBoerickeDatabaseLoaded(): Promise<void> {
  if (isLoaded) return;
  if (isLoading) {
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return;
  }

  isLoading = true;
  try {
    const pathsToTry = [
      JSON_PATH,
      path.join(process.cwd(), "data", "boericke_mm.json"),
      "/app/applet/data/boericke_mm.json"
    ];
    
    let foundPath = "";
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      console.error("[BOERICKE] Database file not found. Paths tried:", pathsToTry);
      isLoading = false;
      return;
    }

    console.log("[BOERICKE] Loading Boericke Materia Medica from:", foundPath);
    const raw = fs.readFileSync(foundPath, "utf-8");
    loadedData = JSON.parse(raw) as BoerickeData;

    lookupMap.clear();
    for (const rem of loadedData.remedies) {
      const cleanAbbrev = rem.abbrev.trim().toLowerCase();
      const cleanName = rem.name.trim().toLowerCase();
      const normName = cleanName.replace(/[^a-z0-9]/g, '');
      const idStr = String(rem.id);
      
      // Store by ID
      lookupMap.set(idStr, rem);

      // Store by abbreviation
      lookupMap.set(cleanAbbrev, rem);
      if (cleanAbbrev.endsWith('.')) {
        lookupMap.set(cleanAbbrev.slice(0, -1), rem);
      }
      
      // Store by name
      lookupMap.set(cleanName, rem);
      // Store by normalized name
      lookupMap.set(normName, rem);
    }

    isLoaded = true;
    console.log(`[BOERICKE] Loaded ${loadedData.remedies.length} remedies and ${Object.keys(loadedData.materiaMedica).length} monographs successfully.`);
  } catch (err) {
    console.error("[BOERICKE] Error loading database:", err);
  } finally {
    isLoading = false;
  }
}

export async function getBoerickeRemedyByAbbrev(abbrevOrName: string): Promise<BoerickeRemedy | null> {
  await ensureBoerickeDatabaseLoaded();
  if (!loadedData) return null;

  const originalTarget = (abbrevOrName || "").trim();
  const target = originalTarget.toLowerCase();
  if (!target) return null;

  // 1. Direct Map lookup (Handles ID, exact abbrev, exact name)
  if (lookupMap.has(target)) return lookupMap.get(target)!;

  // 2. Normalized alphanumeric lookup
  const targetNorm = target.replace(/[^a-z0-9]/g, '');
  if (lookupMap.has(targetNorm)) return lookupMap.get(targetNorm)!;

  const targetNoHyphen = target.replace(/-/g, ' ');
  if (lookupMap.has(targetNoHyphen)) return lookupMap.get(targetNoHyphen)!;

  // 3. Word-Set Matching (Handles inverted names and parenthetical info)
  const targetWords = target.replace(/[()]/g, '').split(/[\s-]+/).filter(w => w.length > 2);
  if (targetWords.length >= 1) {
    const targetSet = new Set(targetWords);
    for (const rem of loadedData.remedies) {
      const remNameWords = rem.name.toLowerCase().replace(/[()]/g, '').split(/[\s-]+/).filter(w => w.length > 2);
      if (remNameWords.length === 0) continue;

      const remSet = new Set(remNameWords);
      
      // Check if all words in the remedy name are present in the target search string
      // e.g. rem "Abelmoschus" (remSet: {abelmoschus}) is found in target "Abelmoschus (Hibiscus abelmoschus)"
      let allRemWordsInTarget = true;
      for (const rw of remNameWords) {
        if (!targetSet.has(rw)) {
          allRemWordsInTarget = false;
          break;
        }
      }

      // OR: Check if all words in the target are in the remedy (for shorter target strings)
      let allTargetWordsInRem = true;
      for (const tw of targetWords) {
        if (!remSet.has(tw)) {
          allTargetWordsInRem = false;
          break;
        }
      }

      if (allRemWordsInTarget || allTargetWordsInRem) {
        return rem;
      }
    }
  }

  // 4. Synonym & Prefix Logic
  const synonyms: Record<string, string[]> = {
    "china": ["cinchona"],
    "puls": ["pulsatilla"],
    "nux": ["nux vomica"],
    "acidum": ["acid"],
    "merc": ["mercurius"],
    "calc": ["calcarea"]
  };

  for (const [key, aliases] of Object.entries(synonyms)) {
    if (target.includes(key)) {
      for (const alias of aliases) {
        const aliasResults = await searchBoerickeRemedies(alias);
        if (aliasResults.length > 0) return aliasResults[0];
      }
    }
  }

  // 5. Fallback prefix match on names
  for (const rem of loadedData.remedies) {
    if (rem.name.toLowerCase().startsWith(target)) return rem;
  }

  // 6. Last resort: standard search
  const results = await searchBoerickeRemedies(target);
  if (results.length > 0) return results[0];

  return null;
}

export async function getBoerickeMateriaMedica(remedyId: number): Promise<BoerickeMonographData | null> {
  await ensureBoerickeDatabaseLoaded();
  if (!loadedData) return null;

  const idStr = String(remedyId);
  return loadedData.materiaMedica[idStr] || null;
}

export async function searchBoerickeRemedies(searchTerm: string): Promise<BoerickeRemedy[]> {
  await ensureBoerickeDatabaseLoaded();
  if (!loadedData) return [];

  const term = (searchTerm || "").trim().toLowerCase();
  if (!term) return [];

  const results: BoerickeRemedy[] = [];
  for (const rem of loadedData.remedies) {
    if (rem.abbrev.toLowerCase().includes(term) || rem.name.toLowerCase().includes(term)) {
      results.push(rem);
      if (results.length >= 50) break;
    }
  }

  return results;
}

export async function getBoerickeRemedyRelationship(remedyId: number): Promise<string | null> {
  await ensureBoerickeDatabaseLoaded();
  if (!loadedData) return null;

  const mm = loadedData.materiaMedica[String(remedyId)];
  if (!mm) return null;

  const relSection = mm.sections.find(
    (s) => s.heading.toLowerCase().includes("relationship") || s.heading.toLowerCase().includes("relation")
  );
  return relSection ? relSection.content : null;
}

export async function getAllBoerickeRemedies(): Promise<BoerickeRemedy[]> {
  await ensureBoerickeDatabaseLoaded();
  if (!loadedData) return [];
  return loadedData.remedies;
}
