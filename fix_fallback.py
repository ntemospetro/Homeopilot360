import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

target = "  const dict = (translatedDicts as any)[language] || {};"
repl = "  const dict = (translatedDicts as any)[language] || (translatedDicts as any)['en'] || {};"
content = content.replace(target, repl)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Fallback fixed")
