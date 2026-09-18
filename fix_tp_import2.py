with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useLanguage } from '../i18n/LanguageContext';", "import { useLanguage } from '../i18n/LanguageContext';\nimport { TranslationKey } from '../i18n/translations';")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)
