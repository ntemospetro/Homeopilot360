import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = "t('hasChildren' as any) || 'Haben Sie Kinder?'"
replacement = "t('hasChildrenLabel' as any) || 'Haben Sie Kinder?'"

content = content.replace(target, replacement)

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)
