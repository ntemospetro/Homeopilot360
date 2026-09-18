import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# Remove localTrans definition
content = re.sub(r'const localTrans.*?\}\};\n', '', content, flags=re.DOTALL)

# Add t to useLanguage hook
content = content.replace("const { language } = useLanguage();", "const { language, t } = useLanguage();")

# Replace tLocal with t
content = content.replace("const tLocal = (key: string) => localTrans[language]?.[key] || localTrans['en']?.[key] || key;", "")
content = content.replace("tLocal('title')", "t('extAnamnesisTitle')")
content = content.replace("tLocal('back')", "t('btnBack')")
content = content.replace("tLocal('next')", "t('btnNext')")
content = content.replace("tLocal('save')", "t('btnCompleteAnamnesis')")
content = content.replace("tLocal('optional')", "t('optionalInfo')")
content = content.replace("tSchema(field.addLabel)", "field.addLabel ? tSchema(field.addLabel) : ''")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

# Remove localTrans definition
content = re.sub(r'const localTrans.*?\}\};\n', '', content, flags=re.DOTALL)

# Replace tLocal with t
content = content.replace("const tLocal = (key: string) => localTrans[language]?.[key] || localTrans['en']?.[key] || key;", "")
content = content.replace("tLocal('", "t('")
content = content.replace("tLocal(\"", "t(\"")
content = content.replace("tLocal(", "t(")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

print("Switched to global t")
