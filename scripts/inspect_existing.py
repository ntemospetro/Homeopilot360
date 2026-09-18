# scripts/inspect_existing.py
import re

total = 0
for i in range(1, 10):
    with open(f"src/data/materiaMedicaPart{i}.ts", "r") as f:
        content = f.read()
        ids = re.findall(r'"id":\s*"([^"]+)"', content)
        print(f"Part {i}: {len(ids)} remedies")
        total += len(ids)

print(f"Total existing remedies: {total}")
