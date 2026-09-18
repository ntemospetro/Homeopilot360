with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

target = "const FieldRenderer = ({ field, values, onChange, isConditionMet }: { field: AnamnesisField, values: any, onChange: (val: any) => void, isConditionMet: (f: AnamnesisField) => boolean }) => {"
replacement = "const FieldRenderer: React.FC<{ field: AnamnesisField, values: any, onChange: (val: any) => void, isConditionMet: (f: AnamnesisField) => boolean }> = ({ field, values, onChange, isConditionMet }) => {"

content = content.replace(target, replacement)
with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
print("Fixed FieldRenderer")
