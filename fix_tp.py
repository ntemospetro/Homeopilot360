with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = """export const TherapistPanel: React.FC<TherapistPanelProps> = ({
  const { language } = useLanguage();
  const tLocal = (key: string) => localTrans[language]?.[key] || localTrans['en']?.[key] || key;

  therapist,"""

replacement = """export const TherapistPanel: React.FC<TherapistPanelProps> = ({
  therapist,"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("target not found")

target2 = """}) => {
  const { t } = useTranslation();"""

replacement2 = """}) => {
  const { language } = useLanguage();
  const tLocal = (key: string) => localTrans[language]?.[key] || localTrans['en']?.[key] || key;
  const { t } = useTranslation();"""

if target2 in content:
    content = content.replace(target2, replacement2)
else:
    print("target2 not found")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

print("Fixed syntax")
