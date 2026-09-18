import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# 1. Fix modal states
target_useEffect = """  useEffect(() => {
    if (isOpen) {
      // Don't reset state if closing and opening again without changing patient
      // but if we receive new initialData we should probably sync.
    }
  }, [isOpen]);"""

replacement_useEffect = """  useEffect(() => {
    if (isOpen) {
      setShowCloseConfirm(false);
      setShowDiscardConfirm(false);
    }
  }, [isOpen]);"""

content = content.replace(target_useEffect, replacement_useEffect)

# 2. Fix dictionary logic in ExtendedAnamnesisWizard
target_dict1 = """  const actualDicts = (translatedDicts as any).default || translatedDicts;
  const dict = actualDicts[language] || actualDicts['en'] || {};
  const tSchema = (text: string) => dict[text] || text;"""

replacement_dict1 = """  const actualDicts = (translatedDicts as any).default || translatedDicts;
  const dict = language === 'de' ? {} : (actualDicts[language] || actualDicts['en'] || {});
  const tSchema = (text: string) => dict[text] || text;"""

content = content.replace(target_dict1, replacement_dict1)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)

print("Done")
