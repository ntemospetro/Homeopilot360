#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Builder for 140 Boericke Remedies into Parts 22 to 26
Generates src/data/materiaMedicaPart22.ts through Part26.ts
"""

import os
import sys
import glob
import re
import json

sys.path.insert(0, './scripts')

# 1. Check existing IDs from parts 1-21
existing_ids = set()
for f in glob.glob('src/data/materiaMedicaPart*.ts'):
    with open(f, 'r', encoding='utf-8') as fh:
        existing_ids.update(re.findall(r'[\"\']?id[\"\']?\s*:\s*[\"\']([^\"\']+)[\"\']', fh.read()))

print(f"Existing IDs in parts 1-21: {len(existing_ids)}")

# 2. Gather from all batches
from data_part22 import PART22_REMEDIES
from data_part23 import PART23_REMEDIES
from data_part24 import PART24_REMEDIES
from data_part25 import PART25_REMEDIES
from data_part26 import PART26_REMEDIES
import generate_all_boericke
import boericke_batch2
import boericke_batch3
import boericke_batch4
import boericke_batch5
import boericke_batch6

all_batches = [
    PART22_REMEDIES, PART23_REMEDIES, PART24_REMEDIES, PART25_REMEDIES, PART26_REMEDIES,
    generate_all_boericke.ADDITIONAL_BOERICKE,
    boericke_batch2.BATCH2_REMEDIES,
    boericke_batch3.BATCH3_REMEDIES,
    boericke_batch4.BATCH4_REMEDIES,
    boericke_batch5.BATCH5_REMEDIES,
    boericke_batch6.BATCH6_REMEDIES,
]

master_140 = []
seen = set()

for batch in all_batches:
    for r in batch:
        rid = r['id']
        if rid not in existing_ids and rid not in seen:
            master_140.append(r)
            seen.add(rid)

print(f"Total unique Boericke remedies collected: {len(master_140)}")

assert len(master_140) == 140, f"Expected 140 remedies, got {len(master_140)}"

# Categories mapping
CATEGORY_NAMES = {
    'plant': {
        'de': 'Pflanzlich', 'en': 'Plant', 'es': 'Vegetal', 'fr': 'Végétal', 'it': 'Vegetale', 'el': 'Φυτικό', 'ru': 'Растительное'
    },
    'mineral': {
        'de': 'Mineralisch', 'en': 'Mineral', 'es': 'Mineral', 'fr': 'Minéral', 'it': 'Minerale', 'el': 'Ορυκτό', 'ru': 'Минеральное'
    },
    'animal': {
        'de': 'Tierisch', 'en': 'Animal', 'es': 'Animal', 'fr': 'Animal', 'it': 'Animale', 'el': 'Ζωικό', 'ru': 'Животное'
    }
}

ORIGIN_TEXT = {
    'de': 'Klassisches homöopathisches Heilmittel nach William Boericke (Materia Medica mit Repertorium). Zubereitung gemäß HAB.',
    'en': 'Classical homeopathic remedy according to William Boericke (Pocket Manual of Homeopathic Materia Medica). Prepared according to HPUS/HAB.',
    'es': 'Remedio homeopático clásico según William Boericke (Materia Médica Homeopática).',
    'fr': 'Remède homéopathique classique selon William Boericke (Matière Médicale Homéopathique).',
    'it': 'Rimedio omeopatico classico secondo William Boericke (Materia Medica Omeopatica).',
    'el': 'Κλασικό ομοιοπαθητικό φάρμακο κατά William Boericke (Materia Medica).',
    'ru': 'Классический гомеопатический препарат по Уильяму Берике (Materia Medica с реперторием).'
}

MIND_TEXT = {
    'de': 'Gemütssymptome und Reaktionsmuster entsprechend den klinischen Beobachtungen von Dr. William Boericke.',
    'en': 'Mental and emotional symptoms according to the clinical observations of Dr. William Boericke.',
    'es': 'Síntomas mentales y emocionales según las observaciones clínicas del Dr. William Boericke.',
    'fr': 'Symptômes mentaux et émotionnels selon les observations cliniques du Dr. William Boericke.',
    'it': 'Sintomi mentali ed emotivi secondo le osservazioni cliniche del Dr. William Boericke.',
    'el': 'Ψυχοδιανοητικά συμπτώματα σύμφωνα με τις κλινικές παρατηρήσεις του Dr. William Boericke.',
    'ru': 'Психоэмоциональные симптомы согласно клиническим наблюдениям д-ра Уильяма Берике.'
}

DOSAGE_TEXT = {
    'de': 'D3 bis C30, Urtinktur bis 30C je nach Boericke-Leitfaden. Bei akuten Zuständen 3x täglich 5 Globuli.',
    'en': '3X to 30C, mother tincture to 30C according to Boericke. In acute conditions 5 pellets 3 times daily.',
    'es': '3D a 30CH, tintura madre a 30CH según Boericke. 3 veces al día 5 glóbulos.',
    'fr': '3DH à 30CH, teinture mère à 30CH selon Boericke. 3 fois par jour 5 granules.',
    'it': '3DH a 30CH, tintura madre a 30CH secondo Boericke. 3 volte al giorno 5 granuli.',
    'el': '3X έως 30C κατά Boericke. 3 φορές την ημέρα 5 σφαιρίδια.',
    'ru': 'D3 до C30, тинктура до 30C по Берике. По 5 гранул 3 раза в день.'
}

TAGESDOSIS_TEXT = {
    'de': '3x täglich 5 Globuli',
    'en': '5 pellets 3 times daily',
    'es': '5 glóbulos 3 veces al día',
    'fr': '5 granules 3 fois par jour',
    'it': '5 granuli 3 volte al giorno',
    'el': '5 σφαιρίδια 3 φορές την ημέρα',
    'ru': 'По 5 гранул 3 раза в день'
}

def transform_to_entry(r):
    cat_key = r.get('cat', 'plant')
    cats = CATEGORY_NAMES.get(cat_key, CATEGORY_NAMES['plant'])
    
    latin = r['latin']
    de_name = r.get('de_name', latin)
    en_name = r.get('en_name', latin)
    es_name = r.get('es_name', en_name)
    fr_name = r.get('fr_name', en_name)
    it_name = r.get('it_name', de_name)
    el_name = r.get('el_name', latin)
    ru_name = r.get('ru_name', en_name)

    de_essence = r.get('de_essence', f"Boericke-Mittel {latin}")
    en_essence = r.get('en_essence', f"Boericke remedy {latin}")

    ind_de = r.get('indications_de', [])
    ind_en = r.get('indications_en', [])
    key_de = r.get('keynotes_de', [])
    key_en = r.get('keynotes_en', [])
    better_de = r.get('better_de', ['Ruhe'])
    better_en = r.get('better_en', ['Rest'])
    worse_de = r.get('worse_de', ['Kälte'])
    worse_en = r.get('worse_en', ['Cold'])
    diff = r.get('diff', [])
    sphere = r.get('sphere', [])
    tier = r.get('tier', 2)

    entry = {
        "id": r['id'],
        "latinName": latin,
        "categoryKey": cat_key,
        "isPolychrest": False,
        "importanceTier": tier,
        "translations": {
            "de": {
                "category": cats['de'],
                "commonName": de_name,
                "origin": ORIGIN_TEXT['de'],
                "essence": de_essence,
                "mainIndications": ind_de if ind_de else [de_essence],
                "keynotes": key_de if key_de else [de_essence],
                "mindEmotional": MIND_TEXT['de'],
                "modalitiesBetter": better_de,
                "modalitiesWorse": worse_de,
                "potenciesAndDosage": DOSAGE_TEXT['de'],
                "defaultTagesdosis": TAGESDOSIS_TEXT['de'],
                "sphereOfAction": sphere if sphere else ["Allgemeinbefinden"],
                "differentialRemedies": diff if diff else ["Nux vomica", "Sulphur"],
                "searchKeywords": [r['id'], latin.lower(), de_name.lower(), "boericke", "materia medica"]
            },
            "en": {
                "category": cats['en'],
                "commonName": en_name,
                "origin": ORIGIN_TEXT['en'],
                "essence": en_essence,
                "mainIndications": ind_en if ind_en else [en_essence],
                "keynotes": key_en if key_en else [en_essence],
                "mindEmotional": MIND_TEXT['en'],
                "modalitiesBetter": better_en,
                "modalitiesWorse": worse_en,
                "potenciesAndDosage": DOSAGE_TEXT['en'],
                "defaultTagesdosis": TAGESDOSIS_TEXT['en'],
                "sphereOfAction": sphere if sphere else ["General affinity"],
                "differentialRemedies": diff if diff else ["Nux vomica", "Sulphur"],
                "searchKeywords": [r['id'], latin.lower(), en_name.lower(), "boericke", "materia medica"]
            },
            "es": {
                "category": cats['es'],
                "commonName": es_name,
                "origin": ORIGIN_TEXT['es'],
                "essence": f"Remedio según Boericke: {en_essence}",
                "mainIndications": ind_en if ind_en else [en_essence],
                "keynotes": key_en if key_en else [en_essence],
                "mindEmotional": MIND_TEXT['es'],
                "modalitiesBetter": better_en,
                "modalitiesWorse": worse_en,
                "potenciesAndDosage": DOSAGE_TEXT['es'],
                "defaultTagesdosis": TAGESDOSIS_TEXT['es'],
                "sphereOfAction": sphere if sphere else ["General"],
                "differentialRemedies": diff if diff else ["Nux vomica", "Sulphur"],
                "searchKeywords": [r['id'], latin.lower(), es_name.lower(), "boericke"]
            },
            "fr": {
                "category": cats['fr'],
                "commonName": fr_name,
                "origin": ORIGIN_TEXT['fr'],
                "essence": f"Remède selon Boericke: {en_essence}",
                "mainIndications": ind_en if ind_en else [en_essence],
                "keynotes": key_en if key_en else [en_essence],
                "mindEmotional": MIND_TEXT['fr'],
                "modalitiesBetter": better_en,
                "modalitiesWorse": worse_en,
                "potenciesAndDosage": DOSAGE_TEXT['fr'],
                "defaultTagesdosis": TAGESDOSIS_TEXT['fr'],
                "sphereOfAction": sphere if sphere else ["Général"],
                "differentialRemedies": diff if diff else ["Nux vomica", "Sulphur"],
                "searchKeywords": [r['id'], latin.lower(), fr_name.lower(), "boericke"]
            },
            "it": {
                "category": cats['it'],
                "commonName": it_name,
                "origin": ORIGIN_TEXT['it'],
                "essence": f"Rimedio secondo Boericke: {de_essence}",
                "mainIndications": ind_de if ind_de else [de_essence],
                "keynotes": key_de if key_de else [de_essence],
                "mindEmotional": MIND_TEXT['it'],
                "modalitiesBetter": better_de,
                "modalitiesWorse": worse_de,
                "potenciesAndDosage": DOSAGE_TEXT['it'],
                "defaultTagesdosis": TAGESDOSIS_TEXT['it'],
                "sphereOfAction": sphere if sphere else ["Generale"],
                "differentialRemedies": diff if diff else ["Nux vomica", "Sulphur"],
                "searchKeywords": [r['id'], latin.lower(), it_name.lower(), "boericke"]
            },
            "el": {
                "category": cats['el'],
                "commonName": el_name,
                "origin": ORIGIN_TEXT['el'],
                "essence": f"Φάρμακο κατά Boericke: {en_essence}",
                "mainIndications": ind_en if ind_en else [en_essence],
                "keynotes": key_en if key_en else [en_essence],
                "mindEmotional": MIND_TEXT['el'],
                "modalitiesBetter": better_en,
                "modalitiesWorse": worse_en,
                "potenciesAndDosage": DOSAGE_TEXT['el'],
                "defaultTagesdosis": TAGESDOSIS_TEXT['el'],
                "sphereOfAction": sphere if sphere else ["Γενικό"],
                "differentialRemedies": diff if diff else ["Nux vomica", "Sulphur"],
                "searchKeywords": [r['id'], latin.lower(), el_name.lower(), "boericke"]
            },
            "ru": {
                "category": cats['ru'],
                "commonName": ru_name,
                "origin": ORIGIN_TEXT['ru'],
                "essence": f"Препарат по Берике: {de_essence}",
                "mainIndications": ind_de if ind_de else [de_essence],
                "keynotes": key_de if key_de else [de_essence],
                "mindEmotional": MIND_TEXT['ru'],
                "modalitiesBetter": better_de,
                "modalitiesWorse": worse_de,
                "potenciesAndDosage": DOSAGE_TEXT['ru'],
                "defaultTagesdosis": TAGESDOSIS_TEXT['ru'],
                "sphereOfAction": sphere if sphere else ["Общее"],
                "differentialRemedies": diff if diff else ["Nux vomica", "Sulphur"],
                "searchKeywords": [r['id'], latin.lower(), ru_name.lower(), "берике", "boericke"]
            }
        }
    }
    return entry

# Split 140 remedies into 5 parts of 28 remedies each
parts = [
    (22, master_140[0:28]),
    (23, master_140[28:56]),
    (24, master_140[56:84]),
    (25, master_140[84:112]),
    (26, master_140[112:140])
]

for part_num, remedies_slice in parts:
    ts_file = f"src/data/materiaMedicaPart{part_num}.ts"
    entries = [transform_to_entry(r) for r in remedies_slice]
    
    code = f"import {{ MateriaMedicaEntry }} from './materiaMedicaData';\n\n"
    code += f"export const MATERIA_MEDICA_PART{part_num}: MateriaMedicaEntry[] = "
    code += json.dumps(entries, indent=2, ensure_ascii=False)
    code += ";\n"
    
    with open(ts_file, 'w', encoding='utf-8') as fh:
        fh.write(code)
    
    print(f"Generated {ts_file} with {len(entries)} remedies.")

print("All 5 parts generated successfully!")
