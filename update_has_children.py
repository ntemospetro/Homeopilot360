import re

with open('src/i18n/translations.ts', 'r') as f:
    content = f.read()

translations = {
    'de': {
        'hasChildren': 'Haben Sie Kinder?'
    },
    'en': {
        'hasChildren': 'Do you have children?'
    },
    'fr': {
        'hasChildren': 'Avez-vous des enfants ?'
    },
    'es': {
        'hasChildren': '¿Tiene hijos?'
    },
    'el': {
        'hasChildren': 'Έχετε παιδιά;'
    },
    'it': {
        'hasChildren': 'Ha dei bambini?'
    },
    'ru': {
        'hasChildren': 'Есть ли у вас дети?'
    }
}

for lang, data in translations.items():
    lang_pattern = r"(\n\s*(" + lang + r")\s*:\s*\{)"
    match = re.search(lang_pattern, content)
    if match:
        insertion_point = match.end()
        new_keys = "\n"
        for key, value in data.items():
            if key not in content[match.end():match.end()+2500]:
                safe_value = value.replace("'", "\\'")
                new_keys += f"    {key}: '{safe_value}',\n"
        content = content[:insertion_point] + new_keys + content[insertion_point:]

with open('src/i18n/translations.ts', 'w') as f:
    f.write(content)
