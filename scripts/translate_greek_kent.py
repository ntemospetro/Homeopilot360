import os, sys, json, time, urllib.request

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY not found in environment.")
    sys.exit(1)

CACHE_TRANS = "./data/kent_translations.json"
CACHE_REP = "./data/kent_repertory_cache.json"

if os.path.exists(CACHE_TRANS):
    with open(CACHE_TRANS, "r", encoding="utf-8") as f:
        translations = json.load(f)
else:
    translations = {}

if "el" not in translations:
    translations["el"] = {}

el_dict = translations["el"]

with open(CACHE_REP, "r", encoding="utf-8") as f:
    rep = json.load(f)

# Priority 1: Symptoms of all 37 chapters
# Priority 2: Sub-modalities
symptoms_set = set()
zusatz_set = set()

for r in rep["rubrics"]:
    s = r.get("symptom", "").strip()
    if s: symptoms_set.add(s)
    for z in r.get("zusatz", []):
        z_str = z.strip()
        if z_str: zusatz_set.add(z_str)

# Filter out already translated terms
missing_symptoms = [s for s in sorted(symptoms_set) if s not in el_dict]
missing_zusatz = [z for z in sorted(zusatz_set) if z not in el_dict and z not in symptoms_set]

all_missing = missing_symptoms + missing_zusatz
print(f"Remaining terms to translate into Greek (el): {len(all_missing)} (Already in dictionary: {len(el_dict)})", flush=True)

BATCH_SIZE = 50
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={API_KEY}"

def translate_batch(batch):
    prompt = f"""You are a licensed clinical and classical homeopathic medical repertory translator (Kent Repertory).
Translate the following German homeopathic repertory terms (symptoms, sensations, modalities, clinical signs, anatomical sites) into Greek ('el') with STRICT medical and classical homeopathic accuracy.

CRITICAL MEDICAL & HOMEOPATHIC TERMINOLOGY RULES FOR GREEK:
- NEVER use colloquial or literal translations.
- "Stuhl" / "Stuhlgang" MUST be translated as "κένωση" or "κόπρανα" (NEVER "καρέκλα"!).
- "drückend" MUST be translated as "πιεστικός (πόνος)" (NEVER "καταθλιπτικός").
- "stechend" MUST be translated as "νυγμώδης" / "διαπεραστικός πόνος".
- "brennend" MUST be translated as "καυστικός" / "καύσος".
- "reißend" MUST be translated as "σχιστικός" / "σπαρακτικός".
- "Zugluft" MUST be translated as "ρεύμα αέρα" (NEVER "τρένο").
- "Erschütterung" MUST be translated as "κραδασμός" / "τράνταγμα".
- "Zerschlagenheit" MUST be translated as "αίσθημα συντριβής" / "μωλωπισμός".
- "Menses" / "Periode" MUST be translated as "έμμηνα" / "καταμήνια".
- "Harn" / "Urin" MUST be translated as "ούρα" / "ούρηση".
- Modalitäten: "besser" -> "βελτίωση με", "schlechter" -> "επιδείνωση με".

Return ONLY a valid JSON object mapping each German term to its Greek clinical translation:
{{"German Term": "Greek Translation", ...}}

German terms:
{json.dumps(batch, ensure_ascii=False)}"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1
        }
    }

    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    for attempt in range(8):
        try:
            with urllib.request.urlopen(req, timeout=35) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
        except Exception as e:
            wait_time = (attempt + 1) * 3
            time.sleep(wait_time)
            if attempt == 7:
                print(f"Batch warning: {e}", flush=True)
                return {}
    return {}

total_batches = (len(all_missing) + BATCH_SIZE - 1) // BATCH_SIZE
print(f"Translating in {total_batches} batches of {BATCH_SIZE} terms.", flush=True)

for idx in range(0, len(all_missing), BATCH_SIZE):
    batch = all_missing[idx:idx + BATCH_SIZE]
    batch_num = (idx // BATCH_SIZE) + 1
    
    res = translate_batch(batch)
    if res and isinstance(res, dict):
        for k, v in res.items():
            if isinstance(v, str) and v.strip():
                el_dict[k] = v.strip()
    
    with open(CACHE_TRANS, "w", encoding="utf-8") as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
        
    if batch_num % 10 == 0 or idx + BATCH_SIZE >= len(all_missing):
        print(f"Progress: [{batch_num}/{total_batches}] -> {len(el_dict)} Greek terms in dictionary.", flush=True)
    
    time.sleep(0.5)

print(f"FINISHED! Total Greek terms in dictionary: {len(el_dict)}", flush=True)
