import sys

with open('src/components/TherapistPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("MessageSquare\n  Printer,", "MessageSquare,\n  Printer,")

content = content.replace("export const TherapistPanel: React.FC<TherapistPanelProps> = ({\n  const [isAnalyzing, setIsAnalyzing] = useState(false);\n  therapist,", "export const TherapistPanel: React.FC<TherapistPanelProps> = ({\n  therapist,")

with open('src/components/TherapistPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Syntax fixed.")
