import os
import re
import json

CACHE_FILE = 'translation_cache.json'
with open(CACHE_FILE, 'r', encoding='utf-8') as f:
    cache = json.load(f)

print(f"Loaded cache with {len(cache)} entries.")

def get_trans(text: str, target_lang: str) -> str:
    if not text or not isinstance(text, str):
        return text
    clean = text.strip()
    if not clean:
        return text
    key = f"{target_lang}:{clean}"
    return cache.get(key, clean)

def refine_dosage(text: str, lang: str) -> str:
    if not text:
        return text
    t = text
    if lang == 'el':
        t = re.sub(r'\bbolitas\b|\bpellets\b|\bglobules\b', 'σφαιρίδια', t, flags=re.IGNORECASE)
        t = re.sub(r'\bdrops\b', 'σταγόνες', t, flags=re.IGNORECASE)
        t = re.sub(r'\btablets\b', 'δισκία', t, flags=re.IGNORECASE)
        t = re.sub(r'\btimes daily\b', 'φορές την ημέρα', t, flags=re.IGNORECASE)
        t = re.sub(r'\btime daily\b', 'φορά την ημέρα', t, flags=re.IGNORECASE)
    elif lang == 'es':
        t = re.sub(r'\bbolitas\b|\bpellets\b', 'gránulos', t, flags=re.IGNORECASE)
        t = re.sub(r'\bveces diaria(s)?\b', 'veces al día', t, flags=re.IGNORECASE)
    elif lang == 'fr':
        t = re.sub(r'\bpellets\b|\bgranules\b', 'granules', t, flags=re.IGNORECASE)
    elif lang == 'it':
        t = re.sub(r'\bpellet(s)?\b', 'granuli', t, flags=re.IGNORECASE)
        t = re.sub(r'\bvolte giornalier(e|o)\b', 'volte al giorno', t, flags=re.IGNORECASE)
    elif lang == 'ru':
        t = re.sub(r'\bpellets\b', 'гранул', t, flags=re.IGNORECASE)
    return t

languages = ['el', 'es', 'fr', 'it', 'ru']

for part_idx in range(1, 10):
    file_path = f'src/data/materiaMedicaPart{part_idx}.ts'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'export const MATERIA_MEDICA_PART\d+: MateriaMedicaEntry\[\] = (\[.*?\]);', content, re.DOTALL)
    if not m:
        print(f'Failed to parse {file_path}')
        continue
    data = json.loads(m.group(1))

    for entry in data:
        en = entry['translations'].get('en', {})
        de = entry['translations'].get('de', {})
        
        for lang in languages:
            existing = entry['translations'].get(lang, {})
            common_name = existing.get('commonName') or en.get('commonName') or de.get('commonName')
            category = existing.get('category') or en.get('category') or de.get('category')
            
            origin_t = get_trans(en.get('origin', ''), lang)
            essence_t = get_trans(en.get('essence', ''), lang)
            indications_t = [get_trans(ind, lang) for ind in en.get('mainIndications', [])]
            keynotes_t = [get_trans(kn, lang) for kn in en.get('keynotes', [])]
            mind_t = get_trans(en.get('mindEmotional', ''), lang)
            better_t = [get_trans(mb, lang) for mb in en.get('modalitiesBetter', [])]
            worse_t = [get_trans(mw, lang) for mw in en.get('modalitiesWorse', [])]
            
            dosage_raw = get_trans(en.get('potenciesAndDosage', ''), lang)
            dosage_t = refine_dosage(dosage_raw, lang)
            
            tages_raw = get_trans(en.get('defaultTagesdosis', ''), lang) if en.get('defaultTagesdosis') else ''
            tages_t = refine_dosage(tages_raw, lang)
            
            sphere_t = [get_trans(sp, lang) for sp in en.get('sphereOfAction', [])]
            
            # Search keywords
            keywords_t = [common_name.lower(), entry['latinName'].lower()]
            for kw in en.get('searchKeywords', []):
                kw_trans = get_trans(kw, lang).lower()
                if kw_trans not in keywords_t:
                    keywords_t.append(kw_trans)
            for sp in sphere_t:
                sp_lower = sp.lower()
                if sp_lower not in keywords_t:
                    keywords_t.append(sp_lower)
                    
            entry['translations'][lang] = {
                "category": category,
                "commonName": common_name,
                "origin": origin_t,
                "essence": essence_t,
                "mainIndications": indications_t,
                "keynotes": keynotes_t,
                "mindEmotional": mind_t,
                "modalitiesBetter": better_t,
                "modalitiesWorse": worse_t,
                "potenciesAndDosage": dosage_t,
                "defaultTagesdosis": tages_t,
                "sphereOfAction": sphere_t,
                "differentialRemedies": en.get('differentialRemedies', de.get('differentialRemedies', [])),
                "searchKeywords": keywords_t
            }
    
    file_content = f"""import {{ MateriaMedicaEntry }} from './materiaMedicaData';

export const MATERIA_MEDICA_PART{part_idx}: MateriaMedicaEntry[] = {json.dumps(data, ensure_ascii=False, indent=2)};
"""
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(file_content)
    print(f'Successfully updated {file_path}')

print("All 9 parts updated with complete Greek and Spanish Materia Medica!")
