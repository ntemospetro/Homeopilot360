import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const currentStepConfig = steps[currentStep];", "  const currentStepConfig = steps[currentStep];\n  console.log('Language:', language, 'Dict Keys:', Object.keys(dict).length, 'Title:', dict['1. Gesundheitszustand'], dict);")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
