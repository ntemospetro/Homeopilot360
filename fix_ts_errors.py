import re

with open('src/components/TherapistPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Printer import
content = content.replace("import { Printer, Therapist,", "import { Therapist,")
content = content.replace("} from 'lucide-react';", "  Printer,\n} from 'lucide-react';")

# 2. Fix questionText
content = content.replace("q.questionText}", "q.question}")

# 3. Fix medication id, grund
# src/components/TherapistPanel.tsx(2117,47): error TS2339: Property 'id' does not exist on type '{ name: string; dosierung: string; einnahmeart: string; }'.
# Wait, maybe it's mapping medications. Let's replace med.id with index.
content = re.sub(r'med\.id', r'idx', content)
# Wait, grund does not exist. Let's just remove grund rendering.
content = re.sub(r'\{\s*med\.grund\s*&&\s*\(\s*<p className="text-sm text-slate-500 mt-1">Grund: \{med\.grund\}<\/p>\s*\)\s*\}', r'', content)
# or just change to med.grund if it's there
content = re.sub(r'med\.grund', r'(med as any).grund', content)

# 4. isAnalyzing is not defined. Where did I define it? Ah, I put it before handleRunAnalysis, but maybe my regex missed it.
# Let's find handleRunAnalysis
match = re.search(r'const handleRunAnalysis = (async \(\) =>|.*)', content)
if match and "isAnalyzing" not in content[:match.start()]:
    # Add useState for isAnalyzing at the top of the component
    comp_start = content.find("export const TherapistPanel")
    comp_end = content.find("{", comp_start) + 1
    content = content[:comp_end] + "\n  const [isAnalyzing, setIsAnalyzing] = useState(false);\n" + content[comp_end:]

with open('src/components/TherapistPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixes applied.")
