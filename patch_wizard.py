import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'translateSchema' not in content:
    content = content.replace("import { anamnesisSchema }", "import { anamnesisSchema } from '../data/anamnesisSchema';\nimport { translateSchema } from '../utils/translateSchema';\nimport translatedDicts from '../data/anamnesisTranslations.json';\n// ")

# Update steps variable
target = "  const steps = anamnesisSchema;"
repl = """  const dict = (translatedDicts as any)[language] || {};
  const steps = translateSchema(anamnesisSchema, dict);"""
content = content.replace(target, repl)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Patched wizard!")
