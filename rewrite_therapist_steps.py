import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

# 1. TOTAL_WIZARD_STEPS
content = re.sub(r'const TOTAL_WIZARD_STEPS = 8;', 'const TOTAL_WIZARD_STEPS = 6;', content)

# 2. stepNames
stepnames_target = """  const stepNames = [
    t('step1Name'),
    t('step2Name'),
    t('step3Name'),
    t('step4Name'),
    t('step5Name'),
    t('step6Name'),
    t('step7Name'),
    t('step8Name'),
  ];"""
stepnames_replacement = """  const stepNames = [
    t('step1Name'),
    t('step2Name'),
    "3. Fragebogen (Erweiterte Anamnese)",
    "4. Befund",
    "5. Medikamenteneinnahme",
    "6. Übersicht & Analyse",
  ];"""
if stepnames_target in content:
    content = content.replace(stepnames_target, stepnames_replacement)

with open('/tmp/TherapistPanel.tsx.intermediate', 'w') as f:
    f.write(content)
