with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()
import re
print("Has VoiceInputButton?", "VoiceInputButton" in content)
