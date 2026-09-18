import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

if "import { VoiceInputButton }" not in content:
    target = "import { Check, X, ArrowRight, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';"
    replacement = "import { Check, X, ArrowRight, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';\nimport { VoiceInputButton } from './VoiceInputButton';"
    content = content.replace(target, replacement)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
