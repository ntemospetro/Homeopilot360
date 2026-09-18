# scripts/generate_all.py
import os
import sys
import json
import re

# Existing 126 remedies to map
EXISTING_IDS = set()
for i in range(1, 10):
    filepath = f"src/data/materiaMedicaPart{i}.ts"
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            ids = re.findall(r'"id":\s*"([^"]+)"', content)
            EXISTING_IDS.update(ids)

print(f"Loaded {len(EXISTING_IDS)} existing remedies from Parts 1-9.")
