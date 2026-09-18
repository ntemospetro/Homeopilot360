import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

target = "const dict = (translatedDicts as any)[language] || (translatedDicts as any)['en'] || {};"
replacement = """const actualDicts = (translatedDicts as any).default || translatedDicts;
  const dict = actualDicts[language] || actualDicts['en'] || {};"""

content = content.replace(target, replacement)

# Also fix title and stepProgress
target_progress = """<span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
              Schritt {currentStep + 1} von {steps.length}
            </span>"""
replacement_progress = """<span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
              {t('stepProgress' as any)?.replace('{current}', String(currentStep + 1)).replace('{total}', String(steps.length)) || `Schritt ${currentStep + 1} von ${steps.length}`}
            </span>"""
content = content.replace(target_progress, replacement_progress)

target_title_h3 = """<h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">{currentStepConfig.title}</h3>"""
replacement_title_h3 = """<h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">{tSchema(currentStepConfig.title)}</h3>"""
content = content.replace(target_title_h3, replacement_title_h3)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Fixed wizard dict logic")
