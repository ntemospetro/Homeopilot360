import re

with open('src/i18n/translations.ts', 'r') as f:
    content = f.read()

translations = {
    "de": {
        "extAnamnesisDesc": "Erfassen Sie strukturiert alle relevanten homöopathischen Daten wie Gesundheitszustand, Modalitäten, Verlangen, Schlaf und Gemüt in einem geführten Schritt-für-Schritt-Fragebogen."
    },
    "en": {
        "extAnamnesisDesc": "Structure and record all relevant homeopathic data such as health status, modalities, desires, sleep, and mind in a guided step-by-step questionnaire."
    },
    "fr": {
        "extAnamnesisDesc": "Structurez et enregistrez toutes les données homéopathiques pertinentes telles que l'état de santé, les modalités, les désirs, le sommeil et l'esprit dans un questionnaire guidé étape par étape."
    },
    "es": {
        "extAnamnesisDesc": "Estructure y registre todos los datos homeopáticos relevantes, como el estado de salud, las modalidades, los deseos, el sueño y la mente en un cuestionario guiado paso a paso."
    },
    "el": {
        "extAnamnesisDesc": "Καταγράψτε δομημένα όλα τα σχετικά ομοιοπαθητικά δεδομένα όπως κατάσταση υγείας, τροποποιητικοί παράγοντες, επιθυμίες, ύπνος και νους σε ένα καθοδηγούμενο ερωτηματολόγιο βήμα προς βήμα."
    },
    "it": {
        "extAnamnesisDesc": "Struttura e registra tutti i dati omeopatici rilevanti come stato di salute, modalità, desideri, sonno e mente in un questionario guidato passo dopo passo."
    },
    "ru": {
        "extAnamnesisDesc": "Структурируйте и запишите все соответствующие гомеопатические данные, такие как состояние здоровья, модальности, желания, сон и психика, в пошаговой анкете."
    }
}

for lang, data in translations.items():
    lang_pattern = r"(\n\s*(" + lang + r")\s*:\s*\{)"
    match = re.search(lang_pattern, content)
    if match:
        insertion_point = match.end()
        new_keys = "\n"
        for key, value in data.items():
            safe_value = value.replace("'", "\\'")
            new_keys += f"    {key}: '{safe_value}',\n"
        content = content[:insertion_point] + new_keys + content[insertion_point:]
        
with open('src/i18n/translations.ts', 'w') as f:
    f.write(content)

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = """<h4 className="font-bold text-slate-800 text-sm mb-1">Erweiterte Homöopathische Anamnese (Fragebogen)</h4>
                          <p className="text-xs text-slate-600 mb-4 max-w-xl">
                            Erfassen Sie strukturiert alle relevanten homöopathischen Daten wie Gesundheitszustand, Modalitäten, Verlangen, Schlaf und Gemüt in einem geführten Schritt-für-Schritt-Fragebogen.
                          </p>"""

replacement = """<h4 className="font-bold text-slate-800 text-sm mb-1">{t('extAnamnesisTitle' as TranslationKey)}</h4>
                          <p className="text-xs text-slate-600 mb-4 max-w-xl">
                            {t('extAnamnesisDesc' as TranslationKey)}
                          </p>"""

content = content.replace(target, replacement)

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

print("Fixed Description")
