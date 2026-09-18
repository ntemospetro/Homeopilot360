import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

if "import { VoiceInputButton }" not in content:
    content = content.replace("import { useLanguage } from '../i18n/LanguageContext';", "import { useLanguage } from '../i18n/LanguageContext';\nimport { VoiceInputButton } from './VoiceInputButton';")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
