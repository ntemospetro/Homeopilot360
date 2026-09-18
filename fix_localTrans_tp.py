import re
with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("clinicalFindings: '{tLocal('clinicalFindings')}'", "clinicalFindings: 'Klinischer Befund'")
content = content.replace("recordFindings: '{tLocal('recordFindings')}'", "recordFindings: 'Befund erfassen?'")
content = content.replace("addMedInfo: '{tLocal('addMedInfo')}'", "addMedInfo: 'Hier können Sie die aktuelle Medikation des Patienten erfassen.'")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)
