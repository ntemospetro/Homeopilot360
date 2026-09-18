import re

with open('src/i18n/translations.ts', 'r') as f:
    content = f.read()

translations = {
    'de': {
        'patientBirthDate': 'Geburtsdatum',
        'patientWeight': 'Gewicht (kg)',
        'patientWeightPlaceholder': 'z.B. 75',
        'patientMaritalStatus': 'Familienstand',
        'maritalSingle': 'Ledig',
        'maritalMarried': 'Verheiratet',
        'maritalDivorced': 'Geschieden',
        'maritalWidowed': 'Verwitwet',
        'maritalOther': 'Sonstiges',
    },
    'en': {
        'patientBirthDate': 'Birth Date',
        'patientWeight': 'Weight (kg)',
        'patientWeightPlaceholder': 'e.g. 75',
        'patientMaritalStatus': 'Marital Status',
        'maritalSingle': 'Single',
        'maritalMarried': 'Married',
        'maritalDivorced': 'Divorced',
        'maritalWidowed': 'Widowed',
        'maritalOther': 'Other',
    },
    'fr': {
        'patientBirthDate': 'Date de naissance',
        'patientWeight': 'Poids (kg)',
        'patientWeightPlaceholder': 'ex. 75',
        'patientMaritalStatus': 'État civil',
        'maritalSingle': 'Célibataire',
        'maritalMarried': 'Marié(e)',
        'maritalDivorced': 'Divorcé(e)',
        'maritalWidowed': 'Veuf / Veuve',
        'maritalOther': 'Autre',
    },
    'es': {
        'patientBirthDate': 'Fecha de nacimiento',
        'patientWeight': 'Peso (kg)',
        'patientWeightPlaceholder': 'p. ej. 75',
        'patientMaritalStatus': 'Estado civil',
        'maritalSingle': 'Soltero/a',
        'maritalMarried': 'Casado/a',
        'maritalDivorced': 'Divorciado/a',
        'maritalWidowed': 'Viudo/a',
        'maritalOther': 'Otro',
    },
    'el': {
        'patientBirthDate': 'Ημερομηνία Γέννησης',
        'patientWeight': 'Βάρος (kg)',
        'patientWeightPlaceholder': 'π.χ. 75',
        'patientMaritalStatus': 'Οικογενειακή Κατάσταση',
        'maritalSingle': 'Άγαμος/η',
        'maritalMarried': 'Έγγαμος/η',
        'maritalDivorced': 'Διαζευγμένος/η',
        'maritalWidowed': 'Χήρος/α',
        'maritalOther': 'Άλλο',
    },
    'it': {
        'patientBirthDate': 'Data di nascita',
        'patientWeight': 'Peso (kg)',
        'patientWeightPlaceholder': 'es. 75',
        'patientMaritalStatus': 'Stato civile',
        'maritalSingle': 'Celibe / Nubile',
        'maritalMarried': 'Sposato/a',
        'maritalDivorced': 'Divorziato/a',
        'maritalWidowed': 'Vedovo/a',
        'maritalOther': 'Altro',
    },
    'ru': {
        'patientBirthDate': 'Дата рождения',
        'patientWeight': 'Вес (кг)',
        'patientWeightPlaceholder': 'напр. 75',
        'patientMaritalStatus': 'Семейное положение',
        'maritalSingle': 'Холост / Не замужем',
        'maritalMarried': 'Женат / Замужем',
        'maritalDivorced': 'В разводе',
        'maritalWidowed': 'Вдовец / Вдова',
        'maritalOther': 'Другое',
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
