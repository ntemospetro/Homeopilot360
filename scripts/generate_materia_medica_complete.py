# scripts/generate_materia_medica_complete.py
"""
Complete Classical Materia Medica Builder.
Generates all remedies of Hahnemann, Kent, and Hering with full i18n support.
Outputs:
- src/data/materiaMedicaPart10.ts through Part21.ts
- src/data/classicalAuthorsMap.ts
- Updates src/data/materiaMedicaData.ts
"""

import os
import sys
import json
import re

print("Starting generation of complete classical materia medica...")

# Read existing remedies from parts 1-9
existing_ids = set()
for i in range(1, 10):
    filepath = f"src/data/materiaMedicaPart{i}.ts"
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            ids = re.findall(r'"id":\s*"([^"]+)"', content)
            existing_ids.update(ids)

print(f"Found {len(existing_ids)} existing remedies in Parts 1-9.")
