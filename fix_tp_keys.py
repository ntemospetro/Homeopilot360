import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

# Add import if needed:
if "TranslationKey" not in content:
    content = content.replace("import { useLanguage } from '../i18n/LanguageContext';", "import { useLanguage, TranslationKey } from '../i18n/LanguageContext';")

# Cast to TranslationKey
content = content.replace("t('chiefComplaint')", "t('chiefComplaint' as TranslationKey)")
content = content.replace("t('modalities')", "t('modalities' as TranslationKey)")
content = content.replace("t('better')", "t('better' as TranslationKey)")
content = content.replace("t('worse')", "t('worse' as TranslationKey)")
content = content.replace("t('mindPsyche')", "t('mindPsyche' as TranslationKey)")
content = content.replace("t('bodyGeneral')", "t('bodyGeneral' as TranslationKey)")
content = content.replace("t('localSymptoms')", "t('localSymptoms' as TranslationKey)")
content = content.replace("t('pastRemedies')", "t('pastRemedies' as TranslationKey)")
content = content.replace("t('medications')", "t('medications' as TranslationKey)")
content = content.replace("t('clinicalFindings')", "t('clinicalFindings' as TranslationKey)")
content = content.replace("t('unknown')", "t('unknown' as TranslationKey)")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

print("Fixed TherapistPanel keys")
