import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# Add useLanguage hook
if 'useLanguage' not in content:
    content = content.replace("import { X,", "import { useLanguage } from '../i18n/LanguageContext';\nimport { X,")

# Add localTrans
if 'localTrans' not in content:
    local_trans = """
const localTrans: Record<string, Record<string, string>> = {
  de: {
    title: 'Erweiterte Homöopathische Anamnese',
    back: 'Zurück',
    next: 'Weiter',
    save: 'Anamnese abschließen / Speichern',
    optional: 'Zusätzliche Information (optional)'
  },
  en: {
    title: 'Extended Homeopathic Anamnesis',
    back: 'Back',
    next: 'Next',
    save: 'Complete Anamnesis / Save',
    optional: 'Additional Information (optional)'
  }
};
"""
    # Insert before the component
    idx = content.find("export const ExtendedAnamnesisWizard")
    content = content[:idx] + local_trans + content[idx:]

# Insert hook inside component
if 'const { language } = useLanguage();' not in content:
    idx2 = content.find("const [currentStep, setCurrentStep] = useState(0);")
    hook = "  const { language } = useLanguage();\n  const tLocal = (key: string) => localTrans[language]?.[key] || localTrans['en']?.[key] || key;\n"
    content = content[:idx2] + hook + content[idx2:]

# Replace texts
content = content.replace("Erweiterte Homöopathische Anamnese", "{tLocal('title')}")
content = content.replace("Zurück", "{tLocal('back')}")
content = content.replace("Weiter", "{tLocal('next')}")
content = content.replace("Anamnese abschließen / Speichern", "{tLocal('save')}")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Added translation keys to ExtendedAnamnesisWizard")
