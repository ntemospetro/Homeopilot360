import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

content = content.replace("const steps = anamnesisSchema;", "const steps = anamnesisSchema;\n  console.log('TranslatedDicts:', typeof translatedDicts, translatedDicts);")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Added console log")
