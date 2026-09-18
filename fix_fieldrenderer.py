import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

target = "const FieldRenderer: React.FC<{ field: AnamnesisField, values: any, onChange: (val: any) => void, isConditionMet: (f: AnamnesisField) => boolean }> = ({ field, values, onChange, isConditionMet }) => {\n  if (!isConditionMet(field)) return null;"

replacement = """const FieldRenderer: React.FC<{ field: AnamnesisField, values: any, onChange: (val: any) => void, isConditionMet: (f: AnamnesisField) => boolean }> = ({ field, values, onChange, isConditionMet }) => {
  const { language } = useLanguage();
  const dict = (translatedDicts as any)[language] || (translatedDicts as any)['en'] || {};
  const tSchema = (text: string) => dict[text] || text;

  if (!isConditionMet(field)) return null;"""

content = content.replace(target, replacement)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Fixed FieldRenderer")
