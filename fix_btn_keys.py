import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

content = content.replace("t('btnBack')", "t('btnStepBack')")
content = content.replace("t('btnNext')", "t('btnStepNext')")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Fixed button keys")
