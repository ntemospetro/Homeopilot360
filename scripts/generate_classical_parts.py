# scripts/generate_classical_parts.py
import json
import os
import re

# We will read existing remedies to ensure no duplicate IDs or Latin names
existing_ids = set()
existing_latins = set()

for i in range(1, 10):
    fn = f"src/data/materiaMedicaPart{i}.ts"
    if os.path.exists(fn):
        with open(fn, "r", encoding="utf-8") as f:
            content = f.read()
            for m in re.finditer(r'"id":\s*"([^"]+)"', content):
                existing_ids.add(m.group(1).lower())
            for m in re.finditer(r'"latinName":\s*"([^"]+)"', content):
                existing_latins.add(m.group(1).lower().strip())

print(f"Loaded {len(existing_ids)} existing IDs from Part 1-9.")
