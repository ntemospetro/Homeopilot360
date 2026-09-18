import re

with open('src/i18n/translations.ts', 'r') as f:
    lines = f.readlines()

keys = {}
for i, line in enumerate(lines):
    match = re.match(r'\s*([a-zA-Z0-9_]+)\s*:', line)
    if match:
        key = match.group(1)
        if key in keys:
            print(f"Duplicate key '{key}' at line {i+1} (first seen at {keys[key]})")
        keys[key] = i+1
