with open('src/i18n/translations.ts', 'r') as f:
    content = f.read()
import re
match = re.search(r'stepSummaryDesc:.*?,', content)
if match:
    print(match.group(0))
