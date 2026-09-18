import re
with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("<span>Medikament</span>", "<span>{tLocal('medication')}</span>")
content = content.replace("<span>Medikament hinzufügen</span>", "<span>{tLocal('addMedication')}</span>")
content = content.replace("'Keine Medikamente eingetragen'", "tLocal('none')")
content = content.replace("? 'Nein'", "? tLocal('no')")
content = content.replace(">Dosierung<", ">{tLocal('dosage')}<")
content = content.replace(">Einnahmeart<", ">{tLocal('intake')}<")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

