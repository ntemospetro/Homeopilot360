import sys

with open('src/components/TherapistPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: MessageSquare Printer
content = content.replace("MessageSquare  Printer,", "MessageSquare,\n  Printer,")

# Fix 2: isAnalyzing misplaced
content = content.replace("export const TherapistPanel: React.FC<TherapistPanelProps> = ({\n  const [isAnalyzing, setIsAnalyzing] = useState(false);\n  therapist,", "export const TherapistPanel: React.FC<TherapistPanelProps> = ({\n  therapist,")
content = content.replace("}) => {\n  const { language } = useLanguage();", "}) => {\n  const [isAnalyzing, setIsAnalyzing] = useState(false);\n  const { language } = useLanguage();")


with open('src/components/TherapistPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Syntax fixed.")
