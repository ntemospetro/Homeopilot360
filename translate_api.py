import urllib.request
import urllib.parse
import json
import time

def translate_text(text, target_lang):
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=" + target_lang + "&dt=t&q=" + urllib.parse.quote(text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        res = json.loads(response.read().decode('utf-8'))
        return "".join([x[0] for x in res[0]])
    except Exception as e:
        print(f"Error translating '{text}': {e}")
        return text

with open('strings.json', 'r') as f:
    strings = json.load(f)

langs = ['en', 'fr', 'el', 'it', 'ru', 'es']
result = {lang: {} for lang in langs}

# To avoid rate limits, translate in chunks
chunk_size = 20
for lang in langs:
    print(f"Translating to {lang}...")
    for i in range(0, len(strings), chunk_size):
        chunk = strings[i:i+chunk_size]
        text_to_translate = " ||| ".join(chunk)
        translated = translate_text(text_to_translate, lang)
        
        # Split back
        translated_parts = [p.strip() for p in translated.split("|||")]
        
        # If lengths mismatch, do one by one for this chunk
        if len(translated_parts) != len(chunk):
            for s in chunk:
                result[lang][s] = translate_text(s, lang)
                time.sleep(0.1)
        else:
            for s, t in zip(chunk, translated_parts):
                result[lang][s] = t
        time.sleep(0.5)

with open('src/data/anamnesisTranslations.json', 'w') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("Done translating!")
