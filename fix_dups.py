import re

# Fix TherapistPanel.tsx
with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("t('step3Name')", "t('tpStep3Name')")
content = content.replace("t('step4Name')", "t('tpStep4Name')")
content = content.replace("t('step5Name')", "t('tpStep5Name')")
content = content.replace("t('step6Name')", "t('tpStep6Name')")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

# Fix translations.ts
with open('src/i18n/translations.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "'3. Fragebogen (Erweiterte Anamnese)'" in line or "'3. Questionnaire (Extended)'" in line or "'3. Questionnaire (étendu)'" in line or "'3. Cuestionario (Extendido)'" in line or "'3. Ερωτηματολόγιο (Εκτεταμένο)'" in line or "'3. Questionario (Esteso)'" in line or "'3. Опросник (Расширенный)'" in line:
        new_lines.append(line.replace('step3Name:', 'tpStep3Name:'))
    elif "'4. Befund'" in line or "'4. Findings'" in line or "'4. Résultats'" in line or "'4. Hallazgos'" in line or "'4. Ευρήματα'" in line or "'4. Reperti'" in line or "'4. Данные осмотра'" in line:
        new_lines.append(line.replace('step4Name:', 'tpStep4Name:'))
    elif "'5. Medikamenteneinnahme'" in line or "'5. Medications'" in line or "'5. Médicaments'" in line or "'5. Medicamentos'" in line or "'5. Φάρμακα'" in line or "'5. Farmaci'" in line or "'5. Лекарства'" in line:
        new_lines.append(line.replace('step5Name:', 'tpStep5Name:'))
    elif "'6. Übersicht & Analyse'" in line or "'6. Overview & Analysis'" in line or "'6. Aperçu et analyse'" in line or "'6. Resumen y análisis'" in line or "'6. Επισκόπηση & Ανάλυση'" in line or "'6. Panoramica e Analisi'" in line or "'6. Обзор и анализ'" in line:
        new_lines.append(line.replace('step6Name:', 'tpStep6Name:'))
    else:
        new_lines.append(line)

with open('src/i18n/translations.ts', 'w') as f:
    f.writelines(new_lines)

print("Fixed duplicate keys")
