with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("t(f.label)", "t(f.label as TranslationKey)")
content = content.replace("t(f.unit)", "t(f.unit as TranslationKey)")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)
