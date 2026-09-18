import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

target = r"// Extracted Field Renderer to handle recursion easily\nconst FieldRenderer.*?;$"

# We need a multiline replace.
# It is better to just split by "// Extracted Field Renderer" and overwrite the rest of the file.

parts = content.split("// Extracted Field Renderer to handle recursion easily")
main_content = parts[0]

renderer_code = """// Extracted Field Renderer to handle recursion easily
const FieldRenderer: React.FC<{ 
  field: AnamnesisField, 
  values: any, 
  onChange: (val: any) => void, 
  isConditionMet: (f: AnamnesisField) => boolean,
  index?: number,
  category?: string,
  prefix?: string 
}> = ({ field, values, onChange, isConditionMet, index = 0, category = '', prefix = '' }) => {
  const { language } = useLanguage();
  const actualDicts = (translatedDicts as any).default || translatedDicts;
  const dict = actualDicts[language] || actualDicts['en'] || {};
  const tSchema = (text: string) => dict[text] || text;
  
  if (!isConditionMet(field)) return null;

  const value = values[field.id];
  const isAnswered = value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);

  if (field.type === 'conditional_group') {
    return (
      <div className="pl-4 border-l-2 border-teal-100 space-y-4 mt-4">
        {field.subFields?.map((sub, subIdx) => (
          <FieldRenderer
            key={sub.id}
            field={sub}
            index={subIdx}
            category={category}
            values={values}
            onChange={(val) => {
              const newValues = { ...values, [sub.id]: val };
              onChange(newValues[sub.id]); // Wait, conditional group logic in the original was complex. Let's look at the original.
            }}
            isConditionMet={isConditionMet}
          />
        ))}
      </div>
    );
  }

  // Original conditional group logic needs to be preserved carefully!
  // Wait, I will just rewrite it based on the old logic.
"""

