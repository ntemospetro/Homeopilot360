import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = r"\{/\* 1\. Stammdaten \*/\}.*?\{/\* 6\. Übersicht & Analyse \*/\}"

# Wait, `currentStep === 6` renders all those inside a grid:
# <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
# ...
# </div>

