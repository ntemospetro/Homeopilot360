import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

target = "const dict = (translatedDicts as any)[language] || (translatedDicts as any)['en'] || {};"
replacement = """const actualDicts = (translatedDicts as any).default || translatedDicts;
  const dict = actualDicts[language] || actualDicts['en'] || {};"""
content = content.replace(target, replacement)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Fixed FieldRenderer dict logic")
