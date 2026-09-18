# scripts/compile_author_catalogs.py
import re

# Existing 126 remedies
existing_ids = set()
for i in range(1, 10):
    with open(f"src/data/materiaMedicaPart{i}.ts") as f:
        existing_ids.update(re.findall(r'"id":\s*"([^"]+)"', f.read()))

print(f"Existing in DB: {len(existing_ids)}")
