import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# 1. Remove translateSchema import and usage
content = content.replace("import { translateSchema } from '../utils/translateSchema';\n", "")
target_steps = """  const dict = (translatedDicts as any)[language] || (translatedDicts as any)['en'] || {};
  const steps = translateSchema(anamnesisSchema, dict);"""
repl_steps = """  const dict = (translatedDicts as any)[language] || (translatedDicts as any)['en'] || {};
  const tSchema = (text: string) => dict[text] || text;
  const steps = anamnesisSchema;"""
content = content.replace(target_steps, repl_steps)

# 2. Add tSchema call when displaying options/labels, but KEEP original `opt` for logic
# For radio:
content = content.replace("<span className=\"leading-snug\">{opt}</span>", "<span className=\"leading-snug\">{tSchema(opt)}</span>")
content = content.replace("<span className=\"text-sm text-slate-700 group-hover:text-slate-900 font-medium\">{opt}</span>", "<span className=\"text-sm text-slate-700 group-hover:text-slate-900 font-medium\">{tSchema(opt)}</span>")
# For labels:
content = content.replace("<label className=\"block text-sm font-bold text-slate-800\">{field.label}</label>", "<label className=\"block text-sm font-bold text-slate-800\">{tSchema(field.label)}</label>")
content = content.replace("<label className=\"block text-sm font-bold text-slate-700 mb-2\">{sub.label}</label>", "<label className=\"block text-sm font-bold text-slate-700 mb-2\">{tSchema(sub.label)}</label>")
# For placeholders:
content = content.replace("placeholder={field.placeholder}", "placeholder={field.placeholder ? tSchema(field.placeholder) : ''}")
content = content.replace("placeholder={sub.placeholder}", "placeholder={sub.placeholder ? tSchema(sub.placeholder) : ''}")

# Step titles:
content = content.replace("<span>{currentStepConfig.title}</span>", "<span>{tSchema(currentStepConfig.title)}</span>")

# For the 'Hinzufügen' buttons:
content = content.replace("{field.addLabel || '+ Hinzufügen'}", "{field.addLabel ? tSchema(field.addLabel) : tSchema('+ Hinzufügen')}")

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Fixed Wizard state mapping")
