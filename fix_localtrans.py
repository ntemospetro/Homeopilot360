import re
with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

content = content.replace("title: '{tLocal('title')}',", "title: 'Erweiterte Homöopathische Anamnese',")
content = content.replace("back: '{tLocal('back')}',", "back: 'Zurück',")
content = content.replace("next: '{tLocal('next')}',", "next: 'Weiter',")
content = content.replace("save: '{tLocal('save')}',", "save: 'Anamnese abschließen / Speichern',")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
print("fixed")
