# scripts/generate_complete_catalog.py
import json, os, re

# Load existing remedy IDs and Latin names from Part 1 to 9
existing_ids = set()
existing_latins = set()

for i in range(1, 10):
    p = f"src/data/materiaMedicaPart{i}.ts"
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
            for m in re.finditer(r'"id":\s*"([^"]+)"', content):
                existing_ids.add(m.group(1).lower().strip())
            for m in re.finditer(r'"latinName":\s*"([^"]+)"', content):
                l_clean = m.group(1).lower().strip().split('/')[0].strip()
                existing_latins.add(l_clean)

print(f"Existing IDs: {len(existing_ids)}")
