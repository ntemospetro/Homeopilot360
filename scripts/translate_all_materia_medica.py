import os
import re
import json
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

CACHE_FILE = 'translation_cache.json'
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
    except Exception:
        cache = {}
else:
    cache = {}

def log(msg):
    print(msg, flush=True)

def save_cache():
    tmp_file = CACHE_FILE + '.tmp'
    with open(tmp_file, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    os.replace(tmp_file, CACHE_FILE)

def single_translate(text: str, target_lang: str) -> str:
    text_clean = text.strip()
    if not text_clean:
        return text
    cache_key = f"{target_lang}:{text_clean}"
    if cache_key in cache:
        return cache[cache_key]

    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q=" + urllib.parse.quote(text_clean)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            res = json.loads(response.read().decode('utf-8'))
            translated = ''.join([part[0] for part in res[0] if part[0]])
            cache[cache_key] = translated
            return translated
    except Exception:
        return text_clean

def process_chunk(chunk, target_lang):
    combined = '\n\n'.join(chunk)
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q=" + urllib.parse.quote(combined)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=6) as response:
            res = json.loads(response.read().decode('utf-8'))
            full = ''.join([part[0] for part in res[0] if part[0]])
            parts = [p.strip() for p in full.split('\n\n') if p.strip()]
            if len(parts) == len(chunk):
                results = {}
                for orig, trans in zip(chunk, parts):
                    results[f"{target_lang}:{orig}"] = trans
                return results
    except Exception:
        pass

    results = {}
    for item in chunk:
        t = single_translate(item, target_lang)
        results[f"{target_lang}:{item}"] = t
    return results

def batch_translate_list(texts: list, target_lang: str):
    uncached = [t.strip() for t in texts if t and t.strip() and f"{target_lang}:{t.strip()}" not in cache]
    log(f"[{target_lang}] Uncached: {len(uncached)} / Total: {len(texts)}")
    if not uncached:
        return

    chunk_size = 10
    chunks = [uncached[i:i + chunk_size] for i in range(0, len(uncached), chunk_size)]
    
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(process_chunk, c, target_lang) for c in chunks]
        done_count = 0
        for f in as_completed(futures):
            res_dict = f.result()
            if res_dict:
                cache.update(res_dict)
            done_count += 1
            if done_count % 15 == 0 or done_count == len(chunks):
                log(f"[{target_lang}] Chunks completed: {done_count}/{len(chunks)}")
                save_cache()

    save_cache()

def get_trans(text: str, target_lang: str) -> str:
    if not text or not isinstance(text, str):
        return text
    clean = text.strip()
    if not clean:
        return text
    key = f"{target_lang}:{clean}"
    return cache.get(key, single_translate(clean, target_lang))

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

def main():
    languages = ['el', 'es', 'fr', 'it', 'ru']
    parts_data = {}
    
    # 1. Read parts
    for part_idx in range(1, 10):
        file_path = f'src/data/materiaMedicaPart{part_idx}.ts'
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        m = re.search(r'export const MATERIA_MEDICA_PART\d+: MateriaMedicaEntry\[\] = (\[.*?\]);', content, re.DOTALL)
        if not m:
            log(f'Failed to parse {file_path}')
            continue
        data = json.loads(m.group(1))
        parts_data[part_idx] = data

    # 2. Extract all strings per language and translate
    for lang in languages:
        texts_for_lang = set()
        for part_idx in range(1, 10):
            data = parts_data[part_idx]
            for entry in data:
                en = entry['translations'].get('en', {})
                if en.get('origin'): texts_for_lang.add(en['origin'])
                if en.get('essence'): texts_for_lang.add(en['essence'])
                for item in en.get('mainIndications', []): texts_for_lang.add(item)
                for item in en.get('keynotes', []): texts_for_lang.add(item)
                if en.get('mindEmotional'): texts_for_lang.add(en['mindEmotional'])
                for item in en.get('modalitiesBetter', []): texts_for_lang.add(item)
                for item in en.get('modalitiesWorse', []): texts_for_lang.add(item)
                if en.get('potenciesAndDosage'): texts_for_lang.add(en['potenciesAndDosage'])
                if en.get('defaultTagesdosis'): texts_for_lang.add(en['defaultTagesdosis'])
                for item in en.get('sphereOfAction', []): texts_for_lang.add(item)
                for item in en.get('searchKeywords', []): texts_for_lang.add(item)
                
        log(f"Translating for {lang} ({len(texts_for_lang)} strings)...")
        batch_translate_list(list(texts_for_lang), lang)
        save_cache()
        log(f"Finished {lang}. Cache size: {len(cache)}")

    # 3. Assemble and save all parts
    log("Building and writing all 9 parts...")
    for part_idx in range(1, 10):
        data = parts_data[part_idx]
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
        
        file_path = f'src/data/materiaMedicaPart{part_idx}.ts'
        file_content = f"""import {{ MateriaMedicaEntry }} from './materiaMedicaData';

export const MATERIA_MEDICA_PART{part_idx}: MateriaMedicaEntry[] = {json.dumps(data, ensure_ascii=False, indent=2)};
"""
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(file_content)
        log(f'Saved localized {file_path}')

    log("ALL 9 PARTS FULLY UPDATED AND SAVED!")

if __name__ == '__main__':
    main()
